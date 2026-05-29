# Guia de Integração - Módulo Ecopontos

## 1. Estrutura de Diretórios Criada

```
backend/src/main/java/com/coletare/backend/modules/ecoponto/
├── adapter/
│   ├── in/
│   │   ├── rest/
│   │   │   └── EcopontoController.java       [6 endpoints REST]
│   │   └── init/
│   │       └── EcopontoSeeder.java            [10 ecopontos de teste]
│   └── out/
│       └── mongo/
│           ├── EcopontoDocument.java          [@Document + @Indexed geoespacial]
│           ├── SpringDataEcopontoRepository.java [MongoRepository interface]
│           └── MongoEcopontoRepositoryAdapter.java [Adapter Domain ↔ Document]
├── application/
│   ├── port/
│   │   ├── in/
│   │   │   └── EcopontoUseCase.java          [7 operações]
│   │   └── out/
│   │       └── EcopontoRepositoryPort.java   [8 métodos]
│   └── service/
│       └── EcopontoService.java              [Implementação de lógica]
└── domain/
    ├── Ecoponto.java                         [Record imutável]
    └── Coordenadas.java                      [Record lat/lon]
```

## 2. Entidades e Relacionamentos

### Ecoponto (Record)
```java
record Ecoponto(
    String id,                      // UUID
    String name,                    // Nome obrigatório
    String address,                 // Endereço obrigatório
    Coordenadas coordenadas,        // Objeto com lat/lon (obrigatório)
    List<String> residueTypes,      // Mínimo 1 tipo
    String contact,                 // Telefone/contato
    String municipalityId,          // FK → municipios (obrigatório)
    List<String> photoUrls,         // URLs armazenadas em MinIO
    String description,             // Descrição opcional
    Boolean isActive,               // Flag de atividade
    Instant createdAt,              // Auto-gerado
    Instant updatedAt               // Auto-gerado
)
```

### Coordenadas (Record)
```java
record Coordenadas(
    Double latitude,                // -90 a +90
    Double longitude                // -180 a +180
)
```

## 3. API REST - Endpoints Disponíveis

### 1. Criar Ecoponto
```http
POST /api/ecopontos
Content-Type: application/json

{
  "name": "Ecoponto Centro",
  "address": "Rua Principal, 100",
  "coordenadas": {
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "residueTypes": ["papel", "metal"],
  "contact": "(11) 3000-0001",
  "municipalityId": "1",
  "photoUrls": [],
  "description": "Centro da cidade"
}

Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ecoponto Centro",
  ...
  "createdAt": "2026-05-28T23:17:09-03:00"
}
```

### 2. Buscar por ID
```http
GET /api/ecopontos/550e8400-e29b-41d4-a716-446655440000

Response: 200 OK
{...}

Response: 404 Not Found (se não existir)
```

### 3. Listar Todos
```http
GET /api/ecopontos

Response: 200 OK
[{...}, {...}, ...]
```

### 4. Listar por Município
```http
GET /api/ecopontos/municipio/1

Response: 200 OK
[{...}, {...}]
```

### 5. Listar por Tipo de Resíduo
```http
GET /api/ecopontos/residue/papel

Response: 200 OK
[{...}, {...}]
```

### 6. Busca Geoespacial (NOVO!)
```http
GET /api/ecopontos/nearby?latitude=-23.5505&longitude=-46.6333&radiusKm=5

Response: 200 OK
[{
  "id": "...",
  "name": "Ecoponto Centro",
  "coordenadas": {
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "distance": "~0.5km"  // informativo
}]
```

### 7. Atualizar
```http
PUT /api/ecopontos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "name": "Ecoponto Centro - Renovado",
  "address": "Rua Principal, 100 - Sala 200",
  ...
}

Response: 200 OK
{...}

Response: 404 Not Found (se não existir)
```

### 8. Deletar
```http
DELETE /api/ecopontos/550e8400-e29b-41d4-a716-446655440000

Response: 204 No Content

Response: 404 Not Found (se não existir)
```

## 4. Configuração do MongoDB

### Índices Necessários
O módulo cria automaticamente os índices ao iniciar. Verificar com:

```bash
mongo
> use coletare
> db.ecopontos.getIndexes()
[
  { key: { _id: 1 }, name: "_id_" },
  { key: { "location": "2dsphere" }, name: "location_2dsphere" }
]
```

### Connection String (application.yml)
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/coletare
      # Ou com autenticação:
      # uri: mongodb://user:password@host:27017/coletare
```

## 5. Seeding Automático

Ao iniciar a aplicação, se a coleção ecopontos estiver vazia, 10 pontos de coleta em São Paulo são inseridos:

```javascript
{
  "name": "Ecoponto Centro",
  "address": "Rua Principal, 100 - Centro",
  "location": {
    "type": "Point",
    "coordinates": [-46.6333, -23.5505]
  },
  "residueTypes": ["papel", "papelão", "metal"],
  "contact": "(11) 3000-0001",
  "municipalityId": "1",
  ...
}
```

Para limpar dados de teste:
```javascript
db.ecopontos.deleteMany({})
```

## 6. Queries MongoDB Comuns

### Buscar por Tipo de Resíduo
```javascript
db.ecopontos.find({ residueTypes: "vidro" })
```

### Buscar por Município
```javascript
db.ecopontos.find({ municipalityId: "1" })
```

### Buscar Ativos
```javascript
db.ecopontos.find({ isActive: true })
```

### Buscar Próximos (Geospatial)
```javascript
db.ecopontos.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-46.6333, -23.5505]
      },
      $maxDistance: 5000
    }
  }
})
```

### Contar Ecopontos por Município
```javascript
db.ecopontos.aggregate([
  { $group: { _id: "$municipalityId", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 7. Tratamento de Erros

### Validações da API

| Erro | HTTP | Causa |
|------|------|-------|
| `"Ecoponto name is required"` | 400 | Nome vazio/nulo |
| `"Ecoponto address is required"` | 400 | Endereço vazio/nulo |
| `"Coordinates are required"` | 400 | Coordenadas nulas |
| `"Latitude must be between -90 and 90"` | 400 | Latitude inválida |
| `"Longitude must be between -180 and 180"` | 400 | Longitude inválida |
| `"At least one residue type is required"` | 400 | Lista de resíduos vazia |
| `"Municipality ID is required"` | 400 | municipalityId nulo/vazio |
| `"Ecoponto not found"` | 404 | ID não existe |
| `"Radius must be greater than 0"` | 400 | Raio negativo/zero |

## 8. Integração com Outros Módulos

### Futuro: Validação de Municipios
```java
// Quando Municipios for reimplementado:
@Autowired
private MunicipioUseCase municipioUseCase;

// No service:
Municipio municipio = municipioUseCase.findById(ecoponto.municipalityId())
    .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));
```

### Fotos em MinIO
```java
// Placeholder para futuro upload
// photoUrls: ["minio://bucket/ecoponto-1.jpg", ...]
```

## 9. Testes Recomendados

### Teste Unitário (EcopontoService)
```java
@Test
void shouldCreateEcopontoWithValidData() {
    Coordenadas coords = new Coordenadas(-23.5505, -46.6333);
    Ecoponto ecoponto = new Ecoponto(null, "Test", "Address", coords, 
        List.of("papel"), "111", "1", List.of(), "Test", true, null, null);
    
    Ecoponto created = service.create(ecoponto);
    
    assertNotNull(created.id());
    assertEquals("Test", created.name());
}
```

### Teste de Integração (EcopontoController)
```java
@Test
void shouldReturnEcoponto_WhenExists() {
    mockMvc.perform(get("/api/ecopontos/550e8400-e29b..."))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Ecoponto Centro"));
}
```

## 10. Performance e Otimizações

### Índices
- ✅ 2dsphere no campo `location` para queries geoespaciais
- ⏳ Considerar índice composto: `{municipalityId, isActive}` para queries frequentes

### Paginação (Futuro)
```java
Page<Ecoponto> listByMunicipality(String municipalityId, Pageable pageable);
```

### Caching (Futuro)
```java
@Cacheable(value = "ecopontos")
public List<Ecoponto> listAll() { ... }
```

## 11. Troubleshooting

### "Collection 'ecopontos' does not exist"
- ✅ Normal - será criada automaticamente na primeira inserção

### Coordenadas invertidas em resultados
- ❌ Verificar ordem: GeoJSON usa `[longitude, latitude]`
- ✅ Domain usa `Coordenadas(latitude, longitude)`
- Adapter converte automaticamente

### Queries geoespaciais muito lentas
- ⚡ Verificar se índice 2dsphere existe: `db.ecopontos.getIndexes()`
- ⚡ Considerar particionar dados por municipality

### "Radius must be greater than 0"
- ✅ Enviar radiusKm > 0 (exemplo: 5 para 5km)

## 12. Checklist de Integração

- [ ] MongoDB rodando e acessível
- [ ] application.yml com URI MongoDB correto
- [ ] Projeto compila: `mvn clean compile` → BUILD SUCCESS
- [ ] Aplicação inicia sem erros
- [ ] Seeder insere 10 ecopontos (verificar em MongoDB)
- [ ] GET /api/ecopontos retorna lista
- [ ] POST /api/ecopontos cria novo (201)
- [ ] GET /api/ecopontos/nearby funciona com coordenadas reais
- [ ] Testes unitários passam
- [ ] Documentação OpenAPI/Swagger atualizada

---

**Módulo Ecopontos:** ✅ Pronto para produção (sujeito a testes adicionais)
