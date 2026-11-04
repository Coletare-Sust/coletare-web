# Test Plan - Dashboard > Inserir Dados de Rotas

## Application Overview

This plan covers the authenticated Dashboard flow for inserting and editing route collection data (massa coletada) on the page `/dashboard/inserir-dados?city=<cityId>`.

Key behaviors observed in the UI:
- Entry point from Dashboard via button "Inserir massa coletada".
- Page header shows "Inserir dados de rotas - <cityName>" and is clickable to navigate back.
- Route list is grouped by route name; each collection card expands to reveal "Dados da coleta".
- Form validation: submitting without massa shows "Digite um número válido".
- Successful submit shows toast "Atualização da coleta feita com sucesso!" and fields become read-only.
- Existing collection can be switched to edit mode via an icon in the details header; saving uses "Editar rota".
- Filtering: route picker + date picker + "Pesquisar rota"; attempting search without date shows toast "Selecione uma data para continuar".

This plan includes scenarios for non-admin users and an admin-only area (CalcData) that is shown only when `user.role === "platformAdmin"`.

## Test Scenarios

### 1. Dashboard - Inserir Dados de Rotas

**Seed:** `specs/seed.spec.ts`

#### 1.1. Navigate from Dashboard to Inserir Dados de Rotas and render base UI

**File:** `specs/dashboard/inserir-dados/navigation.spec.ts`

**Steps:**
  1. -
    - expect: User is authenticated and lands on `/dashboard`.
    - expect: Left navigation is visible (Dashboard, Cadastrar rota, Solicitações, Veículos e colaboradores).
    - expect: The Dashboard contains a visible action/button "Inserir massa coletada".
  2. Click the "Inserir massa coletada" button.
    - expect: Browser navigates to `/dashboard/inserir-dados` and preserves a `city` query parameter (e.g. `?city=<id>`).
    - expect: Page title/heading contains "Inserir dados de rotas -" followed by a city name.
    - expect: A route search control "Pesquisar rota ..." is visible.
    - expect: The route list area renders groups of routes and/or empty-state messages.
  3. Verify at least one route group is displayed (e.g. "Afogados 2") and at least one collection card is present or an explicit empty-state message is shown ("Não há coletas pra essa rota").
    - expect: Route groups are readable and collection cards show Cidade, Data and Tipo de resíduo fields.
    - expect: Empty routes show a message and do not expose data-entry inputs.

#### 1.2. Back navigation via page header returns to Dashboard

**File:** `specs/dashboard/inserir-dados/back-navigation.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>`.
    - expect: Header/Title "Inserir dados de rotas - <cityName>" is clickable and shows a left chevron icon.
  2. Click the page header/title (or chevron area).
    - expect: Browser navigates back to the previous page (expected: `/dashboard`).
    - expect: Dashboard content is visible again (e.g. the "Inserir massa coletada" action).

#### 1.3. Expand a collection card and validate required Massa coletada

**File:** `specs/dashboard/inserir-dados/massa-validation.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>`.
    - expect: At least one collection card is visible under a route group.
  2. Click a collection card (e.g. one showing route name + Cidade + Data + Tipo de resíduo).
    - expect: The card expands and reveals a section titled "Dados da coleta".
    - expect: Field "Km rodados (km)" is present and read-only/disabled.
    - expect: Field "Massa coletada (ton)" is present and editable (enabled).
    - expect: A primary action button "Finalizar" is visible.
  3. Click "Finalizar" without typing a value in "Massa coletada (ton)".
    - expect: An inline validation message appears near Massa coletada: "Digite um número válido".
    - expect: No success toast is shown.
    - expect: The expanded section remains open so the user can correct the input.
  4. Type an invalid value (e.g. letters or a negative number) into "Massa coletada (ton)" and click "Finalizar" again.
    - expect: The field is rejected and an appropriate validation message remains visible (at minimum: "Digite um número válido").
    - expect: No update is persisted.

#### 1.4. Submit Massa coletada successfully and verify read-only/computed fields

**File:** `specs/dashboard/inserir-dados/massa-submit.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>`.
    - expect: A collection card is expanded showing "Dados da coleta" and "Massa coletada (ton)" is editable.
  2. Enter a valid numeric value into "Massa coletada (ton)" (e.g. `1.25`).
    - expect: The value is accepted (no validation error shown).
  3. Click "Finalizar".
    - expect: A success toast appears: "Atualização da coleta feita com sucesso!"
    - expect: After success, the fields in the collection details become disabled/read-only, including Massa coletada.
    - expect: Additional computed/read-only fields are shown (examples observed: "Custo de entrega no aterro (R$/ton)", "Custo de combustível (R$/L)", "Consumo específico (L/km)", "Emissão específica (kgCO2eq/L)").
    - expect: The saved massa value is displayed in the now-disabled field.

#### 1.5. Edit an existing collection (toggle edit mode, save via Editar rota)

**File:** `specs/dashboard/inserir-dados/massa-edit.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>`.
    - expect: A collection card is expanded and currently in read-only state after a successful submit.
    - expect: An icon/button exists in the details header area that toggles edit mode (observed: an icon next to "Dados da coleta").
  2. Click the edit-mode toggle icon in the collection details header.
    - expect: Previously disabled textboxes become enabled/editable.
    - expect: A button labeled "Editar rota" becomes visible.
  3. Change "Massa coletada (ton)" to a different valid number and click "Editar rota".
    - expect: A success toast appears: "Atualização da coleta feita com sucesso!"
    - expect: The form returns to read-only/disabled state after saving.
    - expect: The updated massa value is shown in the disabled field.

#### 1.6. Route picker: filter options by typing and select a route

**File:** `specs/dashboard/inserir-dados/route-picker.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>`.
    - expect: The control "Pesquisar rota ..." is visible at the top of the page.
  2. Click the "Pesquisar rota ..." combobox to open the route picker.
    - expect: A picker dialog/popover opens containing a searchable combobox and a list of route options.
    - expect: A subset of options are visible (examples observed: "Afogados 2", "Afogados", "Teste - IFPE", "Rota Centro", "Rota Duda").
  3. Type a partial route name (e.g. `Afog`) into the picker search field.
    - expect: The option list filters down to matching routes (expected: only routes containing the typed text).
  4. Select one filtered route option (e.g. "Afogados").
    - expect: The picker closes.
    - expect: The selected route name is shown in the main combobox on the page.

#### 1.7. Search requires date: show warning toast if date is missing

**File:** `specs/dashboard/inserir-dados/search-requires-date.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>`.
    - expect: A route may or may not be selected; date is not selected.
    - expect: The button "Pesquisar rota" is visible.
  2. Click "Pesquisar rota" without selecting a date.
    - expect: A warning toast appears: "Selecione uma data para continuar".
    - expect: No filtering is applied to the route list.

#### 1.8. Date picker: select a valid date (past/present) and apply search filter

**File:** `specs/dashboard/inserir-dados/date-and-search.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>`.
    - expect: A route is selected in the route picker combobox.
    - expect: No date is selected yet (button shows "Selecione uma data").
  2. Click the "Selecione uma data" button to open the date picker dialog.
    - expect: A calendar dialog opens showing the current month/year in Portuguese (e.g. "março 2026").
    - expect: Future dates are disabled; at least some valid dates (past or today) are enabled/selectable.
  3. Select an enabled date, then click "Pesquisar rota".
    - expect: The selected date is displayed in the date button/field (not "Selecione uma data").
    - expect: The route list updates to show only collections matching the selected route and date.
    - expect: If no results match, an explicit empty-state is shown (no silent failure).

#### 1.9. Clear filters using the close icon resets list to default

**File:** `specs/dashboard/inserir-dados/clear-filters.spec.ts`

**Steps:**
  1. -
    - expect: User starts on `/dashboard/inserir-dados?city=<id>` with filters applied (route selected and/or date selected).
    - expect: A close icon ("Ícone de fechar") is visible next to the search controls.
  2. Click the close icon (clear filters).
    - expect: Route selection resets back to placeholder "Pesquisar rota ...".
    - expect: Date resets back to "Selecione uma data".
    - expect: Route list returns to the default unfiltered state (shows multiple route groups again).

#### 1.10. Admin-only: CalcData section is visible only for platformAdmin

**File:** `specs/dashboard/inserir-dados/admin-calcdata.spec.ts`

**Steps:**
  1. -
    - expect: User starts from a fresh authenticated session using an account with role `platformAdmin`.
    - expect: User navigates to `/dashboard/inserir-dados?city=<id>`.
  2. Observe the page content above the route list.
    - expect: An admin-only section/component for calculations is visible (CalcData).
    - expect: Non-admin users do NOT see the CalcData section.
  3. Interact with CalcData (if it contains inputs/actions) using valid and invalid values.
    - expect: Admin interactions either calculate and render results, or show clear validation errors.
    - expect: No crashes; results are scoped to the selected city (`cityId`).
