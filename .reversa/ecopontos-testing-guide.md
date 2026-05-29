# Guia de Testes - Módulo Ecopontos

## 1. Preparação do Ambiente de Teste

### 1.1 Verificar Compilação
```bash
cd /Users/ricardo/Downloads/coletare-web/backend
mvn clean compile
# Esperado: BUILD SUCCESS
```

### 1.2 Verificar MongoDB
```bash
mongosh
> use coletare
> db.ecopontos.countDocuments()  # Deve retornar 10 (do seeder) ou 0
```

### 1.3 Iniciar Aplicação
```bash
mvn spring-boot:run
# Esperado: 
# - CREATE TABLE na inicialização
# - Seeder executando: 10 ecopontos inseridos
# - Logs sem ERROR
```

## 2. Testes Manuais com CURL

### 2.1 Teste de Criação (POST)

```bash
curl -X POST http://localhost:8080/api/ecopontos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ecoponto Teste Manual",
    "address": "Rua de Teste, 123",
    "coordenadas": {
      "latitude": -23.5532,
      "longitude": -46.6760
    },
    "residueTypes": ["papel", "vidro"],
    "contact": "(11) 9999-9999",
    "municipalityId": "1",
    "photoUrls": [],
    "description": "Teste manual de criação"
  }'
```

**Resposta Esperada:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Ecoponto Teste Manual",
  "address": "Rua de Teste, 123",
  "coordenadas": {
    "latitude": -23.5532,
    "longitude": -46.6760
  },
  "residueTypes": ["papel", "vidro"],
  "contact": "(11) 9999-9999",
  "municipalityId": "1",
  "photoUrls": [],
  "description": "Teste manual de criação",
  "isActive": true,
  "createdAt": "2026-05-28T23:25:00-03:00",
  "updatedAt": "2026-05-28T23:25:00-03:00"
}
```

**Status HTTP:** 201 Created ✅

### 2.2 Teste de Listagem Completa (GET)

```bash
curl -X GET http://localhost:8080/api/ecopontos
```

**Resposta Esperada:**
```json
[
  {
    "id": "...",
    "name": "Ecoponto Centro",
    ...
  },
  {
    "id": "...",
    "name": "Ecoponto Vila Madalena",
    ...
  },
  ...
]
```

**Status HTTP:** 200 OK ✅

### 2.3 Teste de Busca por ID (GET)

```bash
# Obter ID do primeiro ecoponto
ECOPONTO_ID=$(curl -s http://localhost:8080/api/ecopontos | jq -r '.[0].id')

# Buscar esse ecoponto
curl -X GET http://localhost:8080/api/ecopontos/$ECOPONTO_ID
```

**Resposta Esperada:** Ecoponto específico  
**Status HTTP:** 200 OK ✅

**Com ID Inválido:**
```bash
curl -X GET http://localhost:8080/api/ecopontos/999-invalid-id
```

**Status HTTP:** 404 Not Found ✅

### 2.4 Teste de Busca por Município (GET)

```bash
curl -X GET "http://localhost:8080/api/ecopontos/municipio/1"
```

**Resposta Esperada:** Array com todos os ecopontos do município 1  
**Status HTTP:** 200 OK ✅

### 2.5 Teste de Busca por Tipo de Resíduo (GET)

```bash
curl -X GET "http://localhost:8080/api/ecopontos/residue/papel"
```

**Resposta Esperada:** Array com todos os ecopontos que aceitam "papel"  
**Status HTTP:** 200 OK ✅

### 2.6 Teste de Busca Geoespacial (GET) - **CRÍTICO**

```bash
# Buscar ecopontos num raio de 5km do centro de São Paulo
curl -X GET "http://localhost:8080/api/ecopontos/nearby?latitude=-23.5505&longitude=-46.6333&radiusKm=5"
```

**Resposta Esperada:** Array com ecopontos próximos  
**Status HTTP:** 200 OK ✅

**Teste com Raio Maior:**
```bash
curl -X GET "http://localhost:8080/api/ecopontos/nearby?latitude=-23.5505&longitude=-46.6333&radiusKm=10"
```

**Teste com Parâmetros Inválidos:**
```bash
# Sem parâmetros
curl -X GET "http://localhost:8080/api/ecopontos/nearby"
# Status HTTP: 400 Bad Request ✅

# Raio negativo
curl -X GET "http://localhost:8080/api/ecopontos/nearby?latitude=-23.5505&longitude=-46.6333&radiusKm=-5"
# Status HTTP: 400 Bad Request ✅

# Latitude inválida
curl -X GET "http://localhost:8080/api/ecopontos/nearby?latitude=999&longitude=-46.6333&radiusKm=5"
# Status HTTP: 400 Bad Request ✅
```

### 2.7 Teste de Atualização (PUT)

```bash
# Obter ID
ECOPONTO_ID=$(curl -s http://localhost:8080/api/ecopontos | jq -r '.[0].id')

# Atualizar
curl -X PUT http://localhost:8080/api/ecopontos/$ECOPONTO_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ecoponto Centro - ATUALIZADO",
    "address": "Rua Principal, 100 - Sala 200",
    "coordenadas": {
      "latitude": -23.5505,
      "longitude": -46.6333
    },
    "residueTypes": ["papel", "metal", "vidro"],
    "contact": "(11) 3000-0002",
    "municipalityId": "1",
    "photoUrls": [],
    "description": "Descrição atualizada"
  }'
```

**Status HTTP:** 200 OK ✅

**Com ID Inválido:**
```bash
curl -X PUT http://localhost:8080/api/ecopontos/999-invalid \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Status HTTP: 404 Not Found ✅
```

### 2.8 Teste de Deleção (DELETE)

```bash
# Obter ID
ECOPONTO_ID=$(curl -s http://localhost:8080/api/ecopontos | jq -r '.[0].id')

# Deletar
curl -X DELETE http://localhost:8080/api/ecopontos/$ECOPONTO_ID
```

**Status HTTP:** 204 No Content ✅

**Verificar Deleção:**
```bash
curl -X GET http://localhost:8080/api/ecopontos/$ECOPONTO_ID
# Status HTTP: 404 Not Found ✅
```

## 3. Testes de Validação (400 Bad Request)

### 3.1 Nome Vazio
```bash
curl -X POST http://localhost:8080/api/ecopontos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "address": "Rua",
    "coordenadas": {"latitude": -23.55, "longitude": -46.63},
    "residueTypes": ["papel"],
    "contact": "111",
    "municipalityId": "1"
  }'
# Status: 400 Bad Request
# Body: "Ecoponto name is required"
```

### 3.2 Coordenadas Inválidas (Latitude)
```bash
curl -X POST http://localhost:8080/api/ecopontos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "address": "Rua",
    "coordenadas": {"latitude": 999, "longitude": -46.63},
    "residueTypes": ["papel"],
    "contact": "111",
    "municipalityId": "1"
  }'
# Status: 400 Bad Request
```

### 3.3 Sem Tipos de Resíduo
```bash
curl -X POST http://localhost:8080/api/ecopontos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "address": "Rua",
    "coordenadas": {"latitude": -23.55, "longitude": -46.63},
    "residueTypes": [],
    "contact": "111",
    "municipalityId": "1"
  }'
# Status: 400 Bad Request
```

## 4. Testes no MongoDB

### 4.1 Verificar Seeder
```javascript
mongosh
> use coletare
> db.ecopontos.countDocuments()
# Esperado: 10
```

### 4.2 Listar Todos
```javascript
> db.ecopontos.find().pretty()
```

### 4.3 Teste Geoespacial no MongoDB
```javascript
// Buscar ecopontos num raio de 5km de (-23.5505, -46.6333)
> db.ecopontos.find({
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

### 4.4 Verificar Índices
```javascript
> db.ecopontos.getIndexes()
# Esperado:
# [
#   { key: { _id: 1 }, name: "_id_" },
#   { key: { "location": "2dsphere" }, name: "location_2dsphere" }
# ]
```

## 5. Testes Unitários (JUnit 5)

### 5.1 Teste Service - Criar Ecoponto
```java
@SpringBootTest
class EcopontoServiceTest {
    
    @Autowired
    private EcopontoUseCase ecopontoUseCase;
    
    @Test
    void testCreateEcoponto() {
        Coordenadas coords = new Coordenadas(-23.5505, -46.6333);
        Ecoponto input = new Ecoponto(
            null, "Test", "Address", coords,
            List.of("papel"), "123", "1",
            List.of(), "Test", true, null, null
        );
        
        Ecoponto created = ecopontoUseCase.create(input);
        
        assertNotNull(created.id());
        assertEquals("Test", created.name());
        assertNotNull(created.createdAt());
    }
    
    @Test
    void testCreateEcoponto_InvalidLatitude() {
        Coordenadas badCoords = new Coordenadas(999.0, -46.6333);
        Ecoponto input = new Ecoponto(
            null, "Test", "Address", badCoords,
            List.of("papel"), "123", "1",
            List.of(), "Test", true, null, null
        );
        
        assertThrows(IllegalArgumentException.class, () -> ecopontoUseCase.create(input));
    }
}
```

### 5.2 Teste Controller - GET
```java
@WebMvcTest(EcopontoController.class)
class EcopontoControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private EcopontoUseCase ecopontoUseCase;
    
    @Test
    void testGetAll() throws Exception {
        List<Ecoponto> ecopontos = List.of(...);
        when(ecopontoUseCase.listAll()).thenReturn(ecopontos);
        
        mockMvc.perform(get("/api/ecopontos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name").value("Test"));
    }
}
```

## 6. Teste de Carga (Geoespacial)

### 6.1 Inserir 1000 Ecopontos
```bash
for i in {1..1000}; do
  LAT=$((RANDOM * 1 / 328))  # -90 a 90
  LON=$((RANDOM * 1 / 164))  # -180 a 180
  
  curl -X POST http://localhost:8080/api/ecopontos \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Ecoponto $i\",
      \"address\": \"Rua $i\",
      \"coordenadas\": {\"latitude\": -23.5505, \"longitude\": -46.6333},
      \"residueTypes\": [\"papel\"],
      \"contact\": \"111\",
      \"municipalityId\": \"1\"
    }"
done
```

### 6.2 Teste de Performance
```bash
time curl -X GET "http://localhost:8080/api/ecopontos/nearby?latitude=-23.5505&longitude=-46.6333&radiusKm=5"
# Esperado: < 100ms com índice geoespacial
```

## 7. Checklist de Testes

- [ ] **POST /api/ecopontos** - Criar novo (201)
- [ ] **GET /api/ecopontos** - Listar todos (200)
- [ ] **GET /api/ecopontos/{id}** - Buscar por ID existente (200)
- [ ] **GET /api/ecopontos/{id}** - Buscar por ID inexistente (404)
- [ ] **GET /api/ecopontos/municipio/{id}** - Listar por município (200)
- [ ] **GET /api/ecopontos/residue/{type}** - Listar por resíduo (200)
- [ ] **GET /api/ecopontos/nearby** - Busca geoespacial (200)
- [ ] **GET /api/ecopontos/nearby** - Parâmetros inválidos (400)
- [ ] **PUT /api/ecopontos/{id}** - Atualizar existente (200)
- [ ] **PUT /api/ecopontos/{id}** - Atualizar inexistente (404)
- [ ] **DELETE /api/ecopontos/{id}** - Deletar existente (204)
- [ ] **DELETE /api/ecopontos/{id}** - Deletar inexistente (404)
- [ ] Validação: Nome vazio (400)
- [ ] Validação: Endereço vazio (400)
- [ ] Validação: Coordenadas inválidas (400)
- [ ] Validação: Sem resíduos (400)
- [ ] Validação: Sem município (400)
- [ ] MongoDB - Índice 2dsphere criado
- [ ] MongoDB - Seeder inseriu 10 ecopontos
- [ ] Seeding é idempotente (rodar 2x não duplica)
- [ ] Compilação: BUILD SUCCESS
- [ ] Sem erros nos logs de startup

## 8. Resultado Esperado

✅ **Todos os testes devem passar**  
✅ **Resposta de busca geoespacial em < 100ms**  
✅ **Sem erros HTTP 500**  
✅ **Validações funcionam corretamente**

---

**Status:** Pronto para testes  
**Próximo Passo:** Executar checklist acima
