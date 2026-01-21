# Criar Rota (Create Route) Test Plan

## Application Overview

The "Criar Rota" (Create Route) page allows users to create waste collection routes with map-based location selection. Users can specify route names, collection days, time periods, residue types, and manage multiple waypoints on an interactive Google Map. The page supports primary routes with optional secondary collection routes and suggestions based on withdrawal requests.

## Test Scenarios

### 1. Route Creation - Basic Functionality

**Seed:** `specs/auth.setup.ts`

#### 1.1. Create a simple route with required fields

**File:** `specs/criar-rota/create-simple-route.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter 'Rota Centro' in the route name field
  3. Click on Monday (Seg) in the collection days
  4. Verify Monday is selected
  5. Verify collection period defaults to 'Manhã' (Morning)
  6. Verify residue type defaults to 'Resíduo Comum' (Common Residue)
  7. Click 'Adicionar mais um endereço' to add first address
  8. Click on map to add first location (Recife center)
  9. Wait for address geocoding
  10. Click 'Adicionar mais um endereço' to add second address
  11. Click on map to add second location (North Recife)
  12. Wait for address geocoding
  13. Verify directions display on map between two locations
  14. Click 'Finalizar' button to submit

**Expected Results:**
  - Route name field accepts text input
  - Monday becomes highlighted/selected in the days section
  - Collection period is set to Morning
  - Residue type displays as 'Resíduo Comum'
  - First address input field appears
  - First marker appears on map after clicking
  - Second address input field appears
  - Second marker appears on map after clicking
  - Directions line appears between the two points
  - Success toast displays 'Rota criada com sucesso'
  - User is redirected to '/rotas' page

#### 1.2. Select multiple collection days

**File:** `specs/criar-rota/select-multiple-days.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter 'Rota Semana' in the route name field
  3. Click on Monday (Seg)
  4. Click on Wednesday (Qua)
  5. Click on Friday (Sex)
  6. Verify three days are now selected
  7. Click 'Adicionar mais um endereço' to add first address
  8. Click on map to add first location
  9. Click 'Adicionar mais um endereço' to add second address
  10. Click on map to add second location
  11. Click 'Finalizar' button

**Expected Results:**
  - Route name is entered successfully
  - Monday becomes selected
  - Wednesday becomes selected
  - Friday becomes selected
  - All three days show as selected in the UI
  - First address and marker are added
  - Second address and marker are added
  - Route is created with all three days configured

#### 1.3. Change collection period to afternoon

**File:** `specs/criar-rota/change-period-afternoon.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter 'Rota Tarde' in the route name field
  3. Click on any collection day
  4. Click on 'Tarde' (Afternoon) radio button
  5. Verify Afternoon is now selected
  6. Add two addresses by clicking on map
  7. Click 'Finalizar' button

**Expected Results:**
  - Route name is entered
  - Collection day is selected
  - Afternoon radio button becomes selected/checked
  - Afternoon remains selected throughout the process
  - Two addresses are added successfully
  - Route is created with Afternoon period

#### 1.4. Change residue type from dropdown

**File:** `specs/criar-rota/change-residue-type.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter 'Rota Recicláveis' in the route name field
  3. Select any collection day
  4. Click on the residue type dropdown showing 'Resíduo Comum'
  5. Select 'Recicláveis' from the dropdown options
  6. Verify dropdown now displays 'Recicláveis'
  7. Add two addresses by clicking on map
  8. Click 'Finalizar' button

**Expected Results:**
  - Route name is entered
  - Collection day is selected
  - Dropdown opens showing residue options
  - Residue type changes to selected option
  - Two addresses are added
  - Route is created with new residue type

### 2. Route Creation - Secondary Collections

**Seed:** `specs/auth.setup.ts`

#### 2.1. Create route with secondary collection

**File:** `specs/criar-rota/create-with-secondary-collection.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter 'Rota Principal' in the route name field
  3. Select Monday in collection days
  4. Verify 'Criar coleta secundária' link appears
  5. Click 'Criar coleta secundária' link
  6. Verify secondary collection section appears
  7. Enter 'Rota Secundária' in secondary route name field
  8. Select Wednesday in secondary collection days
  9. Change secondary period to 'Noite' (Night) if desired
  10. Change secondary residue type if desired
  11. Add two addresses by clicking on map
  12. Click 'Finalizar' button

**Expected Results:**
  - Primary route name is entered
  - Primary collection day is selected
  - Secondary collection section appears after clicking link
  - Secondary route name field is visible and editable
  - Secondary collection days are displayed separately
  - Secondary period can be changed
  - Secondary residue type can be changed
  - Two addresses are added to both routes
  - Both primary and secondary routes are created successfully

#### 2.2. Remove secondary collection

**File:** `specs/criar-rota/remove-secondary-collection.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter primary route name
  3. Select a collection day
  4. Click 'Criar coleta secundária' link
  5. Verify secondary collection section appears
  6. Click the X (delete) icon in the secondary collection header
  7. Verify secondary collection section disappears
  8. Verify 'Criar coleta secundária' link reappears
  9. Add two addresses by clicking on map
  10. Click 'Finalizar' button

**Expected Results:**
  - Primary route name is entered
  - Collection day is selected
  - Secondary collection section appears
  - Secondary section removes when X is clicked
  - 'Criar coleta secundária' link is visible again
  - Only primary route is created when submitted

#### 2.3. Validate secondary collection requires name and days

**File:** `specs/criar-rota/secondary-validation.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter 'Rota Principal' in primary route name
  3. Select Monday in primary collection days
  4. Click 'Criar coleta secundária' link
  5. Leave secondary route name empty
  6. Don't select any days for secondary collection
  7. Add two addresses by clicking on map
  8. Click 'Finalizar' button
  9. Verify error message appears

**Expected Results:**
  - Primary route name is valid
  - Primary collection day is selected
  - Secondary section appears
  - Error toast displays 'Revise os campos'
  - Form does not submit
  - Error message indicates secondary route name is required or days are required

### 3. Route Creation - Address Management

**Seed:** `specs/auth.setup.ts`

#### 3.1. Add multiple addresses sequentially

**File:** `specs/criar-rota/add-multiple-addresses.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name 'Rota Multi Endereços'
  3. Select a collection day
  4. Verify first address field is labeled 'Endereço 1'
  5. Click 'Adicionar mais um endereço'
  6. Verify count increases and new address field appears
  7. Add 5 addresses by clicking on map at different locations
  8. Verify all address fields have placeholder text
  9. Verify all addresses appear as markers on the map
  10. Verify route directions update with each new address
  11. Click 'Finalizar' button

**Expected Results:**
  - Route name is entered
  - Collection day is selected
  - First address field shows 'Endereço 1'
  - New address field appears after clicking add button
  - 5 address input fields are visible with sequential numbering
  - 5 markers appear on the map
  - Directions polyline connects all waypoints
  - Route is created with all 5 addresses

#### 3.2. Delete address from route

**File:** `specs/criar-rota/delete-address.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Select a collection day
  4. Add 3 addresses by clicking on map
  5. Verify all 3 addresses and markers are displayed
  6. Click delete icon (trash icon) next to second address
  7. Verify second address field is removed
  8. Verify second marker is removed from map
  9. Verify remaining addresses are re-indexed (Endereço 1, Endereço 2)
  10. Click 'Finalizar' button

**Expected Results:**
  - Route name is entered
  - Collection day is selected
  - 3 addresses are added
  - 3 markers appear on map
  - Delete icon is visible next to second address
  - Second address field is removed when delete is clicked
  - Second marker is removed from map
  - Remaining addresses are renumbered correctly
  - Route is created with remaining 2 addresses

#### 3.3. Add address through address input field

**File:** `specs/criar-rota/add-address-via-input.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Select a collection day
  4. Click on address input field
  5. Type a valid address (e.g., 'Av. Dantas Barreto, Recife')
  6. Verify address suggestions appear
  7. Click on first suggestion
  8. Verify address is filled and marker appears on map
  9. Click 'Adicionar mais um endereço'
  10. Type another address in new field
  11. Click on suggestion
  12. Click 'Finalizar' button

**Expected Results:**
  - Route name is entered
  - Collection day is selected
  - Address input field is focused
  - Suggestions dropdown appears as user types
  - First suggestion can be selected
  - Address is populated and marker appears on map
  - Second address field can be filled similarly
  - Route is created with addresses entered via input

#### 3.4. Validate minimum two addresses required

**File:** `specs/criar-rota/validate-minimum-addresses.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name 'Teste Um Endereço'
  3. Select a collection day
  4. Add only one address by clicking on map
  5. Verify only one marker appears
  6. Click 'Finalizar' button
  7. Verify error appears indicating minimum 2 addresses required

**Expected Results:**
  - Route name is entered
  - Collection day is selected
  - One address is added
  - One marker appears on map
  - Error toast displays 'Revise os campos'
  - Error message indicates 'Adicione ao menos 2 endereços'
  - Form does not submit

#### 3.5. Verify directions polyline updates when addresses change

**File:** `specs/criar-rota/verify-polyline-update.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Select a collection day
  4. Add first address by clicking on map
  5. Add second address by clicking on different location
  6. Verify directions line appears connecting both points
  7. Add third address
  8. Verify directions line updates to include third point
  9. Delete middle address
  10. Verify directions line updates between remaining two addresses

**Expected Results:**
  - Route name and day are set
  - First marker appears on map
  - Second marker appears and directions polyline is drawn
  - Third marker appears and polyline updates to include it
  - When middle address is deleted, polyline reconnects remaining points
  - Route optimization is maintained after deletions

### 4. Route Creation - Validation and Error Handling

**Seed:** `specs/auth.setup.ts`

#### 4.1. Validate empty route name field

**File:** `specs/criar-rota/validate-empty-name.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Leave route name field empty
  3. Select a collection day
  4. Add two addresses by clicking on map
  5. Click 'Finalizar' button
  6. Verify error message appears

**Expected Results:**
  - Route name field remains empty
  - Collection day is selected
  - Two addresses are added
  - Error toast displays 'Revise os campos'
  - Error message indicates 'Nome da rota é obrigatório'
  - Form does not submit and user remains on page

#### 4.2. Validate at least one collection day must be selected

**File:** `specs/criar-rota/validate-collection-days.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Do not select any collection days
  4. Add two addresses by clicking on map
  5. Click 'Finalizar' button
  6. Verify error message appears

**Expected Results:**
  - Route name is entered
  - No collection days are highlighted
  - Two addresses are added
  - Error toast displays 'Revise os campos'
  - Error message indicates 'Selecione ao menos um dia'
  - Form does not submit

#### 4.3. Error toast appears on form submission error

**File:** `specs/criar-rota/error-on-submit.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter all required fields correctly
  3. Add two valid addresses
  4. Click 'Finalizar' button
  5. Observe submission attempt (may require API to fail)

**Expected Results:**
  - Form is fully populated with valid data
  - Submission is attempted
  - If API fails, error toast displays 'Erro ao criar rota'
  - Form validation is maintained
  - User can retry submission

#### 4.4. Deselecting all days after selection

**File:** `specs/criar-rota/toggle-all-days-off.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Click multiple collection days to select them
  4. Click each selected day to deselect them all
  5. Verify all days are deselected
  6. Add two addresses
  7. Click 'Finalizar' button
  8. Verify validation error appears

**Expected Results:**
  - Route name is entered
  - Days become selected when clicked
  - Days become deselected when clicked again
  - All days are deselected
  - Two addresses are added
  - Error indicates at least one day must be selected
  - Form does not submit

### 5. Route Creation - Navigation and Back Button

**Seed:** `specs/auth.setup.ts`

#### 5.1. Navigate back using left arrow button

**File:** `specs/criar-rota/navigate-back.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Verify left arrow button is visible in the page header
  3. Enter some route details (name and days)
  4. Click the left arrow button
  5. Verify navigation back to previous page (rotas)

**Expected Results:**
  - Criar Rota page is displayed
  - Left arrow button with 'Seta para esquerda' alt text is visible
  - Route details are entered
  - Clicking back arrow navigates to previous page
  - No route is created (form is not submitted)

#### 5.2. Page title shows 'Criar nova rota' for new routes

**File:** `specs/criar-rota/verify-create-title.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page without isEdit parameter
  2. Verify page title shows 'Criar nova rota'
  3. Verify 'Criar coleta secundária' option is available

**Expected Results:**
  - Page URL is /criar-rota
  - Page heading displays 'Criar nova rota'
  - Secondary collection option is visible and clickable

### 6. Route Creation - Map Interactions

**Seed:** `specs/auth.setup.ts`

#### 6.1. Click on map to add address location

**File:** `specs/criar-rota/map-click-add-address.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Select a collection day
  4. Click on the map at a specific location
  5. Verify address input field is populated (geocoded)
  6. Verify marker appears at clicked location
  7. Click on map at another location
  8. Verify second address is populated
  9. Verify second marker appears

**Expected Results:**
  - Route name is entered
  - Collection day is selected
  - First map click creates marker at that location
  - Address field is populated with geocoded address
  - Second map click creates second marker
  - Second address field is populated
  - Directions appear between the two points

#### 6.2. Map centers on initial default location (Recife)

**File:** `specs/criar-rota/verify-default-center.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Verify map is visible
  3. Check that map is centered on Recife coordinates (-8.05224, -34.928612)
  4. Verify zoom level is 15

**Expected Results:**
  - Map region is displayed on page
  - Map is initially centered on Recife, Pernambuco
  - Initial zoom level shows city-level detail
  - User can zoom and pan as needed

#### 6.3. Map updates center when addresses are added

**File:** `specs/criar-rota/map-center-update.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Note initial map center (Recife)
  3. Enter route name and select a day
  4. Click on a location far from center (e.g., North Recife)
  5. Verify map pans/centers to show the new location
  6. Add a second address at another location
  7. Verify all markers are visible on map

**Expected Results:**
  - Initial map center is Recife
  - After first click, map centers to first address location
  - Marker appears at first address
  - Second marker appears at second address
  - Map shows both markers with visible directions between them

### 7. Route Creation - Edge Cases

**Seed:** `specs/auth.setup.ts`

#### 7.1. Long route names are accepted

**File:** `specs/criar-rota/long-route-name.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter a very long route name (50+ characters)
  3. Select a collection day
  4. Verify name appears in input field without truncation in field
  5. Add two addresses
  6. Click 'Finalizar' button
  7. Verify route is created successfully

**Expected Results:**
  - Long route name is accepted in input field
  - Name is displayed without errors
  - Form can be submitted with long name
  - Route is created with full name

#### 7.2. Special characters in route names

**File:** `specs/criar-rota/special-chars-name.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name with special characters (e.g., 'Rota #1 - Centro/Sul')
  3. Select a collection day
  4. Add two addresses
  5. Click 'Finalizar' button
  6. Verify route is created with special characters preserved

**Expected Results:**
  - Special characters are accepted in route name
  - Name displays correctly without encoding issues
  - Route is created successfully
  - Name is stored correctly with special characters

#### 7.3. All seven days can be selected simultaneously

**File:** `specs/criar-rota/all-days-selection.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Click on each of the 7 days (Seg, Ter, Qua, Qui, Sex, Sáb, Dom)
  4. Verify all 7 days are selected
  5. Add two addresses
  6. Click 'Finalizar' button
  7. Verify route is created with daily collection

**Expected Results:**
  - All 7 days become selected when clicked
  - All days remain visually highlighted
  - No maximum day limitation is enforced
  - Route is created with daily collection schedule

#### 7.4. Select and change period multiple times

**File:** `specs/criar-rota/period-toggle.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page
  2. Enter route name
  3. Select a collection day
  4. Click 'Tarde' (Afternoon)
  5. Click 'Noite' (Night)
  6. Click 'Manhã' (Morning)
  7. Verify Morning is selected
  8. Add two addresses
  9. Click 'Finalizar' button

**Expected Results:**
  - Morning is initially selected
  - Afternoon becomes selected when clicked
  - Night becomes selected when clicked
  - Morning becomes selected again when clicked
  - Only one period is selected at a time
  - Route is created with correct period

### 8. Route Creation - Suggestions Feature

**Seed:** `specs/auth.setup.ts`

#### 8.1. Verify suggestions feature appears for special routes

**File:** `specs/criar-rota/special-route-suggestions.spec.ts`

**Steps:**
  1. Navigate to the Criar Rota page with especial=true parameter
  2. Verify 'Sugestão de pontos de retirada' section appears
  3. Verify filter dropdown is visible
  4. Verify suggestions list is displayed with withdrawal requests

**Expected Results:**
  - Page loads with special route indicator
  - Suggestions section is visible below addresses
  - Filter button shows 'Filtrar por resíduo'
  - Suggestions list displays available withdrawal requests
