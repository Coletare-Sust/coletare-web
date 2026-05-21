# Code Analysis — coletare-new-back

## Visão geral

- 🟢 **CONFIRMADO** Aplicação web em **Next.js 14** com App Router, escrita majoritariamente em TypeScript/TSX.
- 🟢 **CONFIRMADO** O domínio é operacional: gestão de municípios, usuários, veículos, rotas, coletas, ecopontos, avisos e notificações.
- 🟢 **CONFIRMADO** A persistência é baseada em Firebase Realtime Database/Firestore, Firebase Auth, Firebase Admin e Storage.
- 🟢 **CONFIRMADO** Há integração com Google Maps, Expo Push, SMTP via Nodemailer e API externa para ecopontos.

## Arquitetura técnica

- **Camada de UI:** `src/app/(authenticated)` organiza as páginas autenticadas por rota.
- **Camada de acesso a dados:** `src/store/services/*` concentra chamadas ao Firebase, APIs internas e integrações externas.
- **Camada de estado/consulta:** `src/hooks/queries/*` usa React Query com cache de curto/médio prazo.
- **Camada de domínio:** `src/common/entities/*` e `src/common/dtos/*` definem o formato dos dados principais.

## Principais fluxos identificados

### 1. Provisionamento de município
- Cria credencial no Firebase Auth.
- Persiste o perfil da cidade com papel `admin` no banco.
- Envia email com login e senha para o responsável.
- Em edição, pode substituir a imagem antes de atualizar o registro.

### 2. Gestão de rotas e coletas
- Rotas são criadas com nome, período, dias, tipo de resíduo, waypoints e polyline.
- A tela de detalhes de rota/viagem calcula custo, massa, emissões e consumo a partir das coletas associadas.
- Exportação para XLSX consolida os dados em formato tabular.

### 3. Dashboard analítico
- Consolida dados de coletas dos últimos 12 meses.
- Reorganiza o eixo temporal para exibição anual, semestral e mensal.
- Deriva métricas de custo, combustível, emissão e massa por cidade e por rota.

### 4. Avisos
- Criação e edição suportam upload de imagem.
- Exclusão remove imagem e registro.
- Listagem possui filtro por data e ordenação do mais recente para o mais antigo.

### 5. Notificações
- Envia push via Expo para usuários próximos ao traçado da rota.
- Em rotas especiais, inclui também os autores de solicitações de retirada vinculadas.
- Valida tokens antes de enviar em lote.

## Algoritmos e regras relevantes

- **Agregação temporal móvel:** `getDashboardData` calcula séries por ano/semestre/mês com base na diferença em meses entre a coleta e a data atual.
- **Cálculo de métricas:** custo, consumo, emissões e massa são derivados de valores base da coleta e coeficientes do veículo/aterro.
- **Mapeamento de dias da semana:** booleanos de `RouteEntity.days` são convertidos em labels legíveis.
- **Proximidade geográfica:** notificações comparam a localização do usuário com pontos da polyline para decidir o envio.
- **Upload/remoção de imagens:** municípios e avisos fazem ciclo completo de Storage, evitando registros órfãos.

## Modelo de dados resumido

| Entidade | Campos centrais | Observações |
|---|---|---|
| `UserEntity` | `id`, `name`, `role`, `email`, `cityId`, `image`, `carPlate`, `cpf`, `calcData` | Representa cidade, colaborador, veículo e cidadão conforme `role`.
| `RouteEntity` | `id`, `name`, `period`, `days`, `waypoints`, `polyline`, `isSpecial` | Base para planejamento e monitoramento de coleta.
| `CollectEntity` | `id`, `routeId`, `cityId`, `vehicleName`, `mass`, `consume`, `emission`, `cost`, `duration` | Alimenta dashboard e exportação.
| `WarningEntity` | `id`, `cityId`, `title`, `description`, `image`, `createdAt` | Avisos públicos por cidade.
| `WithdrawalsRequestEntity` | `id`, `type`, `fullAddress`, `latitude`, `longitude`, `isResolved` | Alimenta rotas especiais e notificações.
| `DashboardEntity` | `landfill`, `fuel`, `emission`, `mass` | Séries agregadas para visualização analítica.
| `Ecoponto` | `id`, `cityId`, `name`, `residueType`, `lat`, `lng`, `isActive` | Vem de API REST externa e é filtrado no cliente.

## Inventário funcional por módulo

- **auth:** autenticação local/social, verificação e reset de senha, criação/exclusão de contas admin.
- **dashboard:** gráficos e consolidado analítico de coletas.
- **avisos:** CRUD de avisos com mídia e filtro por data.
- **colaboradores:** manutenção de colaboradores com foto e CPF.
- **veículos:** cadastro/listagem de veículos com login e métricas de consumo/emissão.
- **rotas:** lista, criação e edição de rotas com waypoints e dias de operação.
- **rota:** detalhe operacional de coleta/rota com mapa, métricas e exportação.
- **rotas-andamento:** visão operacional de rotas em execução.
- **ecopontos:** gestão de pontos de descarte via API externa.
- **municípios:** cadastro, edição e exclusão de cidades com provisionamento integrado.
- **solicitações-retirada:** acompanhamento de pedidos de retirada por cidade.
- **email:** envio de email transacional interno.
- **notifications:** disparo de push notifications por proximidade e por rota especial.

## Conclusão

- 🟢 O sistema tem forte acoplamento com Firebase e APIs de apoio, então a próxima fase deve focar em dependências entre módulos e regras implícitas de negócio.
- 🟡 Há algumas lacunas que dependem de inspeção mais profunda em componentes internos de UI e hooks específicos.
