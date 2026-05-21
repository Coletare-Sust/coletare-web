# veiculos

## Visão Geral
Controla cadastro, edição e listagem de veículos da cidade, incluindo métricas de consumo e emissão.

## Responsabilidades
- Cadastrar veículos com credencial (quando novo).
- Editar dados operacionais de veículo.
- Listar veículos por cidade.

## Regras de Negócio
- Veículo é usuário com `role = vehicle`. 🟢
- Novo veículo pode criar login interno com email/senha. 🟢
- Dados de emissão/consumo suportam cálculo de dashboard. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cadastrar veículo | Must | Veículo salvo com role `vehicle` e cidade correta |
| RF-02 | Editar veículo | Should | Placa, emissão e consumo atualizáveis |
| RF-03 | Listar veículos da cidade | Must | Retorno filtrado por `cityId` e `role=vehicle` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Criação de login passa por serviço interno de auth | `src/hooks/useAuth.ts`, `src/app/(authenticated)/cadastrar-veiculo/page.tsx` | 🟡 |
| Disponibilidade | Tratamento de erro via mutation callbacks | `src/app/(authenticated)/cadastrar-veiculo/page.tsx` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado um admin de cidade
Quando cadastrar veículo com dados válidos
Então o veículo deve aparecer na listagem

Dado um veículo existente
Quando editar emissão e consumo
Então os novos valores devem ser persistidos
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cadastro/listagem | Must | Operação básica do módulo |
| Edição | Should | Ajuste operacional contínuo |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/store/services/user.ts` | `getAllVehicles`, `updateUserDoc` | 🟢 |
| `src/app/(authenticated)/cadastrar-veiculo/page.tsx` | `CadastrarVeiculoPage` | 🟢 |
