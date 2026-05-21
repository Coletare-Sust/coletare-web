# Editar Rota (Create Route - Edit Mode) Test Plan

## Application Overview

Plano de testes E2E para edição de rotas no fluxo de criação/edição (/criar-rota?isEdit=true&routeId=...). Cobre carregamento com dados pré-preenchidos, alterações de campos, endereços/waypoints, validações e persistência.

## Test Scenarios

### 1. Editar rota no fluxo de criação

**Seed:** `specs/seed.spec.ts`

#### 1.1. Carregar edição com dados pré-preenchidos

**File:** `tests/criar-rota/editar-rota-preenchido.spec.ts`

**Steps:**
  1. Acessar /rotas e abrir uma rota existente; clicar em Editar rota.
    - expect: A página /criar-rota abre com isEdit=true e routeId na URL.
    - expect: Título da página indica “Editar rota”.
    - expect: Campos Nome, Dias, Período, Resíduo e Endereços aparecem pré-preenchidos.
    - expect: Mapa carrega com os pontos/rota existente.
  2. Inspecionar os endereços listados.
    - expect: Endereços exibem texto legível e correspondem à rota original.
    - expect: Quantidade de endereços é maior que 0.
    - expect: Botão “Adicionar mais um endereço” está visível.

#### 1.2. Editar nome e salvar

**File:** `tests/criar-rota/editar-nome.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Alterar o valor do campo Nome (ex.: adicionar sufixo “- Editado”).
    - expect: Campo Nome reflete o novo valor.
  3. Clicar em Finalizar.
    - expect: Operação de atualização é concluída sem erros visíveis.
    - expect: Ao voltar para /rotas, o card da rota exibe o novo nome.

#### 1.3. Editar dias e período da coleta

**File:** `tests/criar-rota/editar-dias-periodo.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Alternar dias de coleta (ex.: desmarcar um dia e marcar outro).
    - expect: UI indica os dias selecionados corretamente.
    - expect: Não é possível ficar com zero dias selecionados sem erro.
  3. Alterar o período (Manhã/Tarde/Noite).
    - expect: Radio selecionado muda para o novo período.
  4. Clicar em Finalizar.
    - expect: Atualização concluída.
    - expect: Na listagem /rotas, os detalhes de Dias e Período refletem as mudanças.

#### 1.4. Editar tipo de resíduo

**File:** `tests/criar-rota/editar-residuo.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Abrir o seletor de tipo de resíduo e escolher outro tipo.
    - expect: Tipo selecionado é atualizado no formulário.
  3. Clicar em Finalizar.
    - expect: Atualização concluída.
    - expect: Na listagem /rotas, o Tipo de resíduo reflete a mudança.

#### 1.5. Editar endereços - adicionar novo endereço

**File:** `tests/criar-rota/editar-enderecos-adicionar.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Clicar em “Adicionar mais um endereço”.
    - expect: Um novo campo Endereço é adicionado ao formulário.
  3. Preencher o novo endereço (digitando ou clicando no mapa) e aguardar validação.
    - expect: O campo aceita o endereço e não exibe erro de validação.
    - expect: O mapa atualiza a rota (se aplicável).
  4. Clicar em Finalizar.
    - expect: Atualização concluída.
    - expect: Na reabertura da edição, o novo endereço permanece salvo.

#### 1.6. Editar endereços - remover endereço

**File:** `tests/criar-rota/editar-enderecos-remover.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Remover um endereço usando o ícone de excluir no campo correspondente.
    - expect: O campo é removido da lista.
    - expect: Se houver mínimos exigidos, o sistema impede ficar com endereços insuficientes ou mostra erro apropriado.
  3. Clicar em Finalizar.
    - expect: Atualização concluída (ou erro de validação exibido se regras forem violadas).
    - expect: Na reabertura, a lista reflete a remoção quando válida.

#### 1.7. Validação: nome obrigatório

**File:** `tests/criar-rota/editar-validacao-nome.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Limpar o campo Nome.
    - expect: Campo fica vazio.
  3. Clicar em Finalizar.
    - expect: Mensagem de erro “Nome da rota é obrigatório” (ou equivalente).
    - expect: Atualização não é salva.

#### 1.8. Validação: ao menos um dia selecionado

**File:** `tests/criar-rota/editar-validacao-dias.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Desmarcar todos os dias de coleta.
    - expect: Nenhum dia fica selecionado.
  3. Clicar em Finalizar.
    - expect: Mensagem de erro “Selecione ao menos um dia” (ou equivalente).
    - expect: Atualização não é salva.

#### 1.9. Cancelar/Voltar sem salvar

**File:** `tests/criar-rota/editar-cancelar.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Alterar Nome ou Dias sem salvar.
    - expect: Campos exibem alterações não persistidas.
  3. Clicar no botão de voltar (seta).
    - expect: Retorna à tela anterior (/rotas).
    - expect: Alterações não foram persistidas na listagem.

#### 1.10. Falha de atualização (erro de API)

**File:** `tests/criar-rota/editar-erro-api.spec.ts`

**Steps:**
  1. Abrir edição de uma rota existente.
    - expect: Página de edição carregada.
  2. Simular falha de rede/API ao salvar (ex.: interceptar request e retornar 500).
    - expect: Ao clicar em Finalizar, a UI exibe erro de atualização.
    - expect: Nenhuma alteração é persistida na listagem /rotas.
