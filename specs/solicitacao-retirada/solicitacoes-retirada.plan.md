# Solicitações de Retirada E2E Test Plan

## Application Overview

The Solicitações de Retirada (Withdrawal Requests) page is a core feature of the waste management system that displays all garbage collection requests submitted by citizens and drivers. The page allows municipal administrators to view, filter, and manage withdrawal requests. It includes a map view showing the selected request's location, detailed information about each request (requester, type, date, location), and a filterable list of all requests organized by residue type.

## Test Scenarios

### 1. Page Load and Initial Display

**Seed:** `specs/seed.spec.ts`

#### 1.1. Display withdrawal requests page successfully

**File:** `specs/solicitacoes-retirada/page-load.spec.ts`

**Steps:**
  1. Navigate to /solicitacoes-retirada page
    - expect: The page loads without errors
    - expect: The page title should be 'Solicitações de retirada de lixo'
    - expect: The sidebar navigation is visible with 'Solicitação de retirada de lixo' highlighted
    - expect: A count badge showing '46' requests is visible in the sidebar
  2. Verify main components are rendered
    - expect: The header shows 'Solicitações de retirada de lixo' title
    - expect: A 'Criar nova rota' button with plus icon is visible
    - expect: A Google Maps component is displayed on the left side
    - expect: The request details card is displayed on the right side showing 'Ponto de lixo em aberto'
    - expect: The 'Todas as solicitações' section is visible below
    - expect: A 'Filtrar por resíduo' dropdown button is visible
  3. Verify the first request details are displayed
    - expect: The map shows a marker for the selected request
    - expect: The details card displays all information fields: Origem, Solicitante, Contato/CPF, Situação, Local, Tipo de Resíduo, Data
    - expect: The status shows 'Ponto de lixo em aberto'
    - expect: A message 'Resolva esse e outros pontos em aberto em criar rota de ponto de lixo' is displayed

#### 1.2. Display all withdrawal requests in the list

**File:** `specs/solicitacoes-retirada/requests-list-display.spec.ts`

**Steps:**
  1. Scroll to the 'Todas as solicitações' section
    - expect: Multiple withdrawal request cards are visible
    - expect: Each card shows: Status (Aberto), Local, Solicitante, Data, Tipo de Residuo
    - expect: Request cards are organized in a grid layout
    - expect: At least 40+ requests are displayed in the list
  2. Verify request card information format
    - expect: Each card has a status badge showing 'Aberto'
    - expect: The address is displayed in full format
    - expect: The date is formatted in Brazilian format (DD/MM/YYYY)
    - expect: The residue type is clearly labeled
    - expect: The requester name is visible

### 2. Request Filtering Functionality

**Seed:** `specs/seed.spec.ts`

#### 2.1. Filter requests by residue type

**File:** `specs/solicitacoes-retirada/filter-by-residue.spec.ts`

**Steps:**
  1. Click on the 'Filtrar por resíduo' dropdown button
    - expect: A dropdown menu opens showing all residue type options
    - expect: The following options are visible: Resíduo comum, Grandes Volumes, Resíduos de Construção, Resíduos Mistos (Mix), Resíduos de Podas, Recicláveis
    - expect: Each option has a radio button
  2. Select 'Grandes Volumes' from the filter
    - expect: The radio button for 'Grandes Volumes' is selected
    - expect: The request list updates to show only 'Grandes Volumes' requests
    - expect: All displayed cards show 'Grandes Volumes' as the residue type
    - expect: The number of displayed requests is reduced to match the filter
  3. Select 'Resíduos de Construção' from the filter
    - expect: The request list updates to show only 'Resíduos de Construção' requests
    - expect: All displayed cards show 'Resíduos de Construção' as the residue type
  4. Select 'Recicláveis' from the filter
    - expect: The request list updates to show only 'Recicláveis' requests
    - expect: All displayed cards show 'Recicláveis' as the residue type
  5. Close the filter dropdown without selecting
    - expect: The dropdown closes
    - expect: The previously selected filter remains active
    - expect: The request list remains filtered

#### 2.2. Clear filter to show all requests

**File:** `specs/solicitacoes-retirada/clear-filter.spec.ts`

**Steps:**
  1. Apply a filter (e.g., 'Grandes Volumes')
    - expect: The list shows only filtered requests
  2. Open the filter dropdown and deselect the current option or close without selection
    - expect: The filter is cleared
    - expect: All requests are displayed again
    - expect: The total count returns to the original number (46+)

### 3. Request Selection and Details

**Seed:** `specs/seed.spec.ts`

#### 3.1. View different request details by clicking

**File:** `specs/solicitacoes-retirada/select-request.spec.ts`

**Steps:**
  1. Note the current request details displayed (e.g., first request)
    - expect: The details card shows specific request information
    - expect: The map displays a marker at the request location
  2. Click on a different request card from the list (e.g., second request)
    - expect: The URL updates with query parameters: ?garbagePoint={id}&city={cityId}
    - expect: The page scrolls to the top automatically
    - expect: The map updates to show the new request location
    - expect: The marker moves to the new coordinates
    - expect: The details card updates with the new request information
  3. Verify the details update correctly
    - expect: All fields update: Origem, Solicitante, Contato/CPF, Situação, Local, Tipo de Resíduo, Data
    - expect: The information matches the selected request from the list
    - expect: The map center corresponds to the request address
  4. Click on another request (e.g., third request)
    - expect: The details and map update again
    - expect: The page scrolls to top
    - expect: The new request information is displayed correctly

#### 3.2. Verify request origin types

**File:** `specs/solicitacoes-retirada/request-origin-types.spec.ts`

**Steps:**
  1. Select a request created by a citizen (Cidadão)
    - expect: Origem field shows 'Cidadão'
    - expect: The contact field label is 'Contato'
    - expect: The contact value shows an email address
    - expect: Situação shows 'Residência' or 'Local Inapropriado'
  2. Select a request created by a driver (Motorista)
    - expect: Origem field shows 'Motorista'
    - expect: The contact field label is 'CPF'
    - expect: The contact value shows a CPF number
    - expect: Situação shows the type of improper location

### 4. Map Functionality

**Seed:** `specs/seed.spec.ts`

#### 4.1. Interact with Google Maps

**File:** `specs/solicitacoes-retirada/map-interaction.spec.ts`

**Steps:**
  1. Verify the map displays correctly
    - expect: Google Maps loads successfully
    - expect: A marker with number '1' is visible at the request location
    - expect: The map is centered on the request coordinates
    - expect: The zoom level is set to 15
    - expect: Map controls are visible (zoom, street view, fullscreen)
  2. Click the 'Toggle fullscreen view' button
    - expect: The map expands to fullscreen mode
    - expect: The marker remains visible
  3. Exit fullscreen mode
    - expect: The map returns to normal size
    - expect: All other page elements are visible again
  4. Switch to Satellite view
    - expect: The map changes from street view to satellite imagery
    - expect: The marker remains visible on the satellite view
  5. Switch back to Map view
    - expect: The map returns to street map view
    - expect: The marker is still visible

#### 4.2. Map updates when selecting different requests

**File:** `specs/solicitacoes-retirada/map-updates.spec.ts`

**Steps:**
  1. Note the current map center coordinates
    - expect: The map shows a specific location
  2. Select a request from a different location
    - expect: The map re-centers to the new request location
    - expect: The marker updates to the new coordinates
    - expect: The marker label still shows '1'
    - expect: The transition is smooth
  3. Select multiple requests in sequence
    - expect: The map updates for each selection
    - expect: The marker always points to the selected request location
    - expect: No errors occur during rapid selection changes

### 5. Navigation and Actions

**Seed:** `specs/seed.spec.ts`

#### 5.1. Create new route from withdrawal request

**File:** `specs/solicitacoes-retirada/create-route-button.spec.ts`

**Steps:**
  1. Click the 'Criar nova rota' button
    - expect: The user is redirected to the route creation page
    - expect: The URL shows '/criar-rota?especial=true'
    - expect: The query parameter indicates this is a special route for withdrawal requests

#### 5.2. Navigate back to withdrawal requests page

**File:** `specs/solicitacoes-retirada/navigation-back.spec.ts`

**Steps:**
  1. From the route creation page, click the browser back button
    - expect: The user returns to the withdrawal requests page
    - expect: The previously selected request is still displayed
    - expect: The page state is preserved (same request, same filter if applied)

#### 5.3. Sidebar navigation

**File:** `specs/solicitacoes-retirada/sidebar-navigation.spec.ts`

**Steps:**
  1. Click on 'Dashboard' in the sidebar
    - expect: The user is redirected to the dashboard page
    - expect: The URL changes to '/dashboard'
  2. Return to withdrawal requests via sidebar
    - expect: Click on 'Solicitação de retirada de lixo' in sidebar
    - expect: The withdrawal requests page loads
    - expect: The page shows the default first request
    - expect: No filters are applied

### 6. URL State Management

**Seed:** `specs/seed.spec.ts`

#### 6.1. Direct URL access with query parameters

**File:** `specs/solicitacoes-retirada/url-state.spec.ts`

**Steps:**
  1. Navigate to a specific request via URL with query parameters (e.g., /solicitacoes-retirada?garbagePoint=XXX&city=YYY)
    - expect: The page loads with the specified request selected
    - expect: The map shows the correct request location
    - expect: The details card displays the correct request information
    - expect: The request is highlighted or identified in the list
  2. Refresh the page while viewing a specific request
    - expect: The page reloads
    - expect: The same request remains selected
    - expect: All details and map position are preserved
    - expect: No data is lost

#### 6.2. URL updates when selecting requests

**File:** `specs/solicitacoes-retirada/url-updates.spec.ts`

**Steps:**
  1. Load the page without query parameters
    - expect: The URL updates automatically with the first request's parameters
    - expect: The format is: ?garbagePoint={id}&city={cityId}
  2. Click on different requests
    - expect: Each click updates the URL query parameters
    - expect: The garbagePoint parameter changes to the new request ID
    - expect: The city parameter remains consistent
    - expect: Browser history is updated allowing back/forward navigation

### 7. Data Display and Formatting

**Seed:** `specs/seed.spec.ts`

#### 7.1. Verify data formatting

**File:** `specs/solicitacoes-retirada/data-formatting.spec.ts`

**Steps:**
  1. Review multiple request cards
    - expect: All dates are formatted in Brazilian format (DD/MM/YYYY)
    - expect: Addresses are displayed in full
    - expect: Names are properly capitalized
    - expect: Email addresses and CPF numbers are correctly formatted
    - expect: Status labels are in Portuguese
  2. Check residue type labels
    - expect: All residue types use Portuguese labels
    - expect: Labels match the filter options exactly
    - expect: Common types include: 'Resíduo comum', 'Grandes Volumes', 'Resíduos de Construção', 'Resíduos Mistos (Mix)', 'Resíduos de Podas', 'Recicláveis'

#### 7.2. Handle missing or incomplete data

**File:** `specs/solicitacoes-retirada/missing-data.spec.ts`

**Steps:**
  1. If requests with incomplete data exist, select them
    - expect: The page handles missing fields gracefully
    - expect: No undefined or null values are displayed
    - expect: Placeholder or empty states are shown appropriately
    - expect: No JavaScript errors occur

### 8. Scrolling and User Experience

**Seed:** `specs/seed.spec.ts`

#### 8.1. Auto-scroll on request selection

**File:** `specs/solicitacoes-retirada/auto-scroll.spec.ts`

**Steps:**
  1. Scroll down to the bottom of the requests list
    - expect: Multiple requests are visible
    - expect: The page scrolls smoothly
  2. Click on a request card
    - expect: The page automatically scrolls to the top
    - expect: The scroll is smooth and not jarring
    - expect: The selected request details are immediately visible
    - expect: The map is in view

#### 8.2. Scroll through long request list

**File:** `specs/solicitacoes-retirada/scroll-list.spec.ts`

**Steps:**
  1. Scroll through the entire list of requests
    - expect: All 46+ requests are accessible by scrolling
    - expect: No layout issues occur during scrolling
    - expect: Request cards load properly
    - expect: Performance remains smooth with many cards

### 9. Responsive Behavior and Layout

**Seed:** `specs/seed.spec.ts`

#### 9.1. Verify layout structure

**File:** `specs/solicitacoes-retirada/layout.spec.ts`

**Steps:**
  1. Observe the page layout
    - expect: The header with title and button is at the top
    - expect: The map and details card are side by side in the main section
    - expect: The 'Todas as solicitações' section is below the map/details
    - expect: The layout is clean and organized
    - expect: Proper spacing between elements

### 10. Error Handling and Edge Cases

**Seed:** `specs/seed.spec.ts`

#### 10.1. Handle invalid request ID in URL

**File:** `specs/solicitacoes-retirada/invalid-request-id.spec.ts`

**Steps:**
  1. Navigate to /solicitacoes-retirada?garbagePoint=INVALID_ID&city=VALID_CITY
    - expect: The page loads without crashing
    - expect: An appropriate error message or fallback is displayed
    - expect: The page defaults to showing the first available request
    - expect: No console errors related to the invalid ID

#### 10.2. Handle empty state (no requests)

**File:** `specs/solicitacoes-retirada/empty-state.spec.ts`

**Steps:**
  1. If possible, navigate to a city with no requests or simulate empty state
    - expect: An appropriate empty state message is displayed
    - expect: No errors occur
    - expect: The page remains functional
    - expect: Instructions or guidance for the user are provided

#### 10.3. Map loading errors

**File:** `specs/solicitacoes-retirada/map-error-handling.spec.ts`

**Steps:**
  1. Monitor console for any map loading warnings or errors
    - expect: The page handles Google Maps API warnings gracefully
    - expect: Baseline data warnings don't affect functionality
    - expect: LoadScript warnings are logged but don't break the page
    - expect: The map still renders and functions correctly
