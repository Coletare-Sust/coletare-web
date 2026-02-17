# Cadastrar Veículo (Register Vehicle) Test Plan

## Application Overview

The "Cadastrar Veículo" page is a vehicle registration form accessible in the authenticated area of the Coletare application. It allows authorized users to register new vehicles with essential information like name, license plate, emission values, and fuel consumption. The page also supports editing existing vehicles. The form includes fields for vehicle details and login credentials (for new vehicles), with proper validation for all inputs.

## Test Scenarios

### 1. Vehicle Registration - New Vehicle Creation

**Seed:** `specs/auth.setup.ts`

#### 1.1. Successfully register a new vehicle with all required fields

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'Test Vehicle' in the 'Nome do veículo' field
  3. Enter 'ABC-1234' in the 'Placa' field
  4. Enter '2.5' in the 'Emissão (kgCO2eq/L)' field
  5. Enter '0.8' in the 'Consumo (L/km)' field
  6. Enter a valid email in the 'Criar login' field
  7. Enter 'Password123!' in the 'Senha' field
  8. Enter 'Password123!' in the 'Confirmar senha' field
  9. Click the 'Cadastrar' button
  10. Verify success toast notification appears

**Expected Results:**
  - All fields accept the input without errors
  - Submit button is clickable
  - Vehicle is successfully registered
  - Success notification is displayed
  - User is redirected or form is cleared

#### 1.2. Validate vehicle name minimum length requirement

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'ABC' (less than 4 characters) in the 'Nome do veículo' field
  3. Tab to another field to trigger validation
  4. Observe error message for vehicle name field

**Expected Results:**
  - Error message 'Deve ter no mínimo 4 caracteres' is displayed
  - Submit button remains disabled or form cannot be submitted
  - Field is highlighted with error styling

#### 1.3. Validate license plate minimum length requirement

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'AB-123' (less than 7 characters) in the 'Placa' field
  3. Tab to another field to trigger validation
  4. Observe error message for plate field

**Expected Results:**
  - Error message 'A placa deve ter no mínimo 7 caracteres' is displayed
  - Submit button remains disabled
  - Field is highlighted with error styling

#### 1.4. Validate emission field accepts only valid numbers

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'invalid' in the 'Emissão (kgCO2eq/L)' field
  3. Tab to another field to trigger validation
  4. Observe error message for emission field

**Expected Results:**
  - Error message 'Digite um número válido' is displayed
  - Submit button is disabled
  - Field is highlighted with error styling

#### 1.5. Validate consumption field accepts only valid numbers

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'abc123' in the 'Consumo (L/km)' field
  3. Tab to another field to trigger validation
  4. Observe error message for consumption field

**Expected Results:**
  - Error message 'Digite um número válido' is displayed
  - Submit button is disabled
  - Field is highlighted with error styling

#### 1.6. Validate email field accepts valid email format

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'notanemail' in the 'Criar login' field
  3. Tab to another field to trigger validation
  4. Observe error message for email field

**Expected Results:**
  - Error message related to invalid email format is displayed
  - Submit button is disabled
  - Field is highlighted with error styling

#### 1.7. Validate password field meets requirements

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'weak' in the 'Senha' field
  3. Tab to another field to trigger validation
  4. Observe error message for password field

**Expected Results:**
  - Error message is displayed indicating password does not meet requirements
  - Submit button is disabled

#### 1.8. Validate password confirmation must match

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter valid vehicle details (name, plate, emission, consumption, email)
  3. Enter 'Password123!' in the 'Senha' field
  4. Enter 'Password456!' in the 'Confirmar senha' field
  5. Attempt to submit the form
  6. Observe error message for password confirmation

**Expected Results:**
  - Error message 'As senhas não são iguais' is displayed
  - Form submission is prevented
  - Confirmation password field is highlighted

#### 1.9. All new registration fields are required

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Leave all fields empty
  3. Attempt to submit the form
  4. Observe validation errors

**Expected Results:**
  - All required fields show validation error messages
  - Submit button is disabled
  - Form cannot be submitted

#### 1.10. Accept decimal numbers for emission and consumption

**File:** `specs/cadastrar-veiculo.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Enter 'Test Vehicle' in the 'Nome do veículo' field
  3. Enter 'ABC-1234' in the 'Placa' field
  4. Enter '2.456' in the 'Emissão (kgCO2eq/L)' field
  5. Enter '0.75' in the 'Consumo (L/km)' field
  6. Enter 'vehicle@test.com' in the 'Criar login' field
  7. Enter 'ValidPass123!' in the 'Senha' field
  8. Enter 'ValidPass123!' in the 'Confirmar senha' field
  9. Submit the form

**Expected Results:**
  - Decimal numbers are accepted without errors
  - Form is successfully submitted
  - Vehicle is registered with decimal values

### 2. Vehicle Registration - Edit Mode

**Seed:** `specs/auth.setup.ts`

#### 2.1. Edit mode displays existing vehicle data

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page with query parameters ?isEdit=true&id=existing_vehicle_id
  2. Verify all fields are pre-populated with existing vehicle data
  3. Verify 'Criar login' section (email/password fields) are not visible

**Expected Results:**
  - Vehicle name field contains existing vehicle name
  - Plate field contains existing plate
  - Emission field contains existing emission value
  - Consumption field contains existing consumption value
  - No email/password fields are displayed in edit mode
  - Button label shows 'Editar' instead of 'Cadastrar'

#### 2.2. Successfully update vehicle name

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Nome do veículo' field
  3. Enter 'Updated Vehicle Name'
  4. Click the 'Editar' button
  5. Verify success notification

**Expected Results:**
  - Vehicle name is successfully updated
  - Success toast notification appears
  - User is redirected to veiculos-colaboradores page

#### 2.3. Successfully update vehicle plate

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Placa' field
  3. Enter 'XYZ-9876'
  4. Click the 'Editar' button
  5. Verify success notification

**Expected Results:**
  - Vehicle plate is successfully updated
  - Success toast notification appears
  - User is redirected to veiculos-colaboradores page

#### 2.4. Successfully update emission value

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Emissão (kgCO2eq/L)' field
  3. Enter '3.5'
  4. Click the 'Editar' button
  5. Verify success notification

**Expected Results:**
  - Vehicle emission value is successfully updated
  - Success toast notification appears
  - User is redirected to veiculos-colaboradores page

#### 2.5. Successfully update consumption value

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Consumo (L/km)' field
  3. Enter '1.2'
  4. Click the 'Editar' button
  5. Verify success notification

**Expected Results:**
  - Vehicle consumption value is successfully updated
  - Success toast notification appears
  - User is redirected to veiculos-colaboradores page

#### 2.6. Validate updated vehicle name in edit mode

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Nome do veículo' field
  3. Enter 'AB' (less than 4 characters)
  4. Tab to another field to trigger validation

**Expected Results:**
  - Error message 'Deve ter no mínimo 4 caracteres' is displayed
  - Submit button is disabled
  - Form cannot be submitted

#### 2.7. Validate updated vehicle plate in edit mode

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Placa' field
  3. Enter 'ABC' (less than 7 characters)
  4. Tab to another field to trigger validation

**Expected Results:**
  - Error message 'A placa deve ter no mínimo 7 caracteres' is displayed
  - Submit button is disabled

#### 2.8. Validate updated emission in edit mode

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Emissão (kgCO2eq/L)' field
  3. Enter 'not-a-number'
  4. Tab to another field to trigger validation

**Expected Results:**
  - Error message 'Digite um número válido' is displayed
  - Submit button is disabled

#### 2.9. Validate updated consumption in edit mode

**File:** `specs/cadastrar-veiculo-edit.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page in edit mode with ?isEdit=true&id=existing_vehicle_id
  2. Clear the 'Consumo (L/km)' field
  3. Enter 'xyz'
  4. Tab to another field to trigger validation

**Expected Results:**
  - Error message 'Digite um número válido' is displayed
  - Submit button is disabled

### 3. Vehicle Registration - UI and User Experience

**Seed:** `specs/auth.setup.ts`

#### 3.1. Plate field applies correct mask format

**File:** `specs/cadastrar-veiculo-ui.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Click on the 'Placa' input field
  3. Type 'ABC1234'
  4. Observe the formatted value

**Expected Results:**
  - Plate field applies mask 'XXX-XXXX' format
  - Input is displayed as 'ABC-1234' after typing

#### 3.2. Password field hides character input

**File:** `specs/cadastrar-veiculo-ui.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Click on the 'Senha' input field
  3. Type 'Password123!'
  4. Observe password field masking

**Expected Results:**
  - Password characters are hidden/masked
  - Dots or asterisks are shown instead of actual characters

#### 3.3. Confirm password field hides character input

**File:** `specs/cadastrar-veiculo-ui.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Click on the 'Confirmar senha' input field
  3. Type 'Password123!'
  4. Observe password field masking

**Expected Results:**
  - Confirm password characters are hidden/masked
  - Dots or asterisks are shown instead of actual characters

#### 3.4. Submit button shows loading state

**File:** `specs/cadastrar-veiculo-ui.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Fill in all required fields with valid data
  3. Click the 'Cadastrar' button
  4. Observe button state during submission

**Expected Results:**
  - Submit button shows loading indicator
  - Button becomes disabled during submission
  - Form cannot be submitted again while loading

#### 3.5. Verify form layout and field organization

**File:** `specs/cadastrar-veiculo-ui.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Take a visual inventory of the form layout
  3. Verify all expected fields are present
  4. Verify button is positioned correctly

**Expected Results:**
  - All input fields are visible and properly labeled
  - Submit button is visible and clickable
  - Form is wrapped in RegisterVehiclesCollaborators container
  - Fields are displayed in the correct order

#### 3.6. Verify error messages are properly displayed

**File:** `specs/cadastrar-veiculo-ui.spec.ts`

**Steps:**
  1. Navigate to the cadastrar-veiculo page
  2. Leave the 'Nome do veículo' field empty
  3. Click on another field to trigger validation
  4. Observe error message display

**Expected Results:**
  - Error message appears below the field
  - Field is highlighted with error styling
  - Error message is readable and descriptive
