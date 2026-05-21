# Domain — coletare-new-back

## Glossário

- 🟢 **CONFIRMADO** **Município/Cidade**: conta administradora da operação local, com `role = admin`, vinculada a credenciais Firebase Auth e dados em Realtime Database.
- 🟢 **CONFIRMADO** **Colaborador**: usuário com `role = employee`, associado a uma cidade e usado em operações administrativas.
- 🟢 **CONFIRMADO** **Veículo**: usuário com `role = vehicle`, com placa, consumo e emissão específicos.
- 🟢 **CONFIRMADO** **Rota**: planejamento operacional com período, dias de execução, tipo de resíduo, waypoints e polyline.
- 🟢 **CONFIRMADO** **Coleta**: execução real de uma rota, com massa, consumo, emissões, custo e duração.
- 🟢 **CONFIRMADO** **Aviso**: comunicação textual/mídia publicada por cidade e exibida na interface.
- 🟢 **CONFIRMADO** **Solicitação de retirada**: pedido de coleta feito por cidadão, podendo ou não estar resolvido.
- 🟢 **CONFIRMADO** **Ecoponto**: ponto de descarte consultado por API externa, com múltiplos tipos de resíduo.
- 🟡 **INFERIDO** **Rota especial**: rota que inclui solicitações de retirada vinculadas e amplia a base de notificação.
- 🟡 **INFERIDO** **Dashboard**: visão analítica agregada por janela temporal (ano/semestre/mês).

## Regras principais

1. 🟢 **CONFIRMADO** O cadastro de município é um fluxo em duas etapas: criar usuário no Firebase Auth e depois persistir o perfil da cidade no banco.
2. 🟢 **CONFIRMADO** Em municípios, uma imagem nova substitui a anterior e a antiga é removida do Storage antes do update.
3. 🟢 **CONFIRMADO** Avisos só são criados para usuários com permissão administrativa e usam upload/remoção de imagem no Storage.
4. 🟢 **CONFIRMADO** O dashboard calcula custo, massa, emissão e combustível a partir das coletas dos últimos 12 meses.
5. 🟢 **CONFIRMADO** O detalhe de rota exporta relatórios XLSX com métricas derivadas das coletas daquela rota.
6. 🟢 **CONFIRMADO** Notificações são enviadas para usuários próximos à polyline da rota; em rotas especiais, autores de solicitações vinculadas também entram.
7. 🟢 **CONFIRMADO** Ecopontos são mantidos via API REST externa e podem ter seleção múltipla de resíduos.
8. 🟡 **INFERIDO** A separação entre `admin` e `platformAdmin` define níveis distintos de acesso local e operacional.
9. 🟡 **INFERIDO** A persistência de coletas e rotas usa chaves de cidade para permitir agregação por território.

## Decisões históricas observadas no Git

- 🟢 **CONFIRMADO** `feature: Adiciona funcionalidade de cadastro e gestão de ecopontos` e refactors subsequentes mostram evolução de ecopontos para seleção múltipla de resíduos.
- 🟢 **CONFIRMADO** `feature(load_tests): teste de carga para coletas em tempo real` indica preocupação com consulta de coletas em volume.
- 🟢 **CONFIRMADO** `feat(layout): implementa exibicao condicional da sidebar baseada na rota` e commits correlatos mostram consolidação de navegação por contexto autenticado.
- 🟢 **CONFIRMADO** `refactor(live-route): rota em tempo real pegando localizacao atual` e `fix(routes): screen of route details fixed` reforçam a centralidade das rotas ao vivo.
- 🟢 **CONFIRMADO** `feature(colaborator): now an employee can have a profile pic` confirma suporte a upload de foto para colaboradores.

## Lacunas

- 🔴 **LACUNA** Não há ADRs formais no repositório; as decisões foram inferidas do código e dos commits.
- 🔴 **LACUNA** A fronteira exata entre `admin` e `platformAdmin` ainda precisa de validação cruzada em telas protegidas e hooks de autorização.
