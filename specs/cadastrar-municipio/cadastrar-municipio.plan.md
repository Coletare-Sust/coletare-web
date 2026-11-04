# Municipality Registration Test Plan

## Application Overview

Comprehensive end-to-end test plan for the Municipality Registration/Edit page in the Coletare waste management system. This page allows authorized users to register new municipalities or edit existing ones, including municipal details, facilitator information, calculation parameters, and visual branding (image and color).

## Test Scenarios

### 1. Municipality Registration - Create Mode

**Seed:** `specs/seed.spec.ts`

#### 1.1. Successfully create a new municipality with all required fields

**File:** `tests/municipios/create-municipality-success.spec.ts`

**Steps:**
  1. Navigate to the municipality registration page (/municipios/cadastrar)
    - expect: Page displays 'Cadastrar novo município' title
    - expect: Form is displayed with all required fields visible
    - expect: Image upload area shows placeholder image
    - expect: Color selection grid is displayed
    - expect: All input fields are empty and editable
  2. Upload a valid municipality image (PNG/JPEG/JPG format)
    - expect: Image preview updates to show uploaded image
    - expect: File input accepts the uploaded file
    - expect: No error messages are displayed
  3. Select a color from the color palette (e.g., red)
    - expect: Selected color is visually highlighted with border
    - expect: Color selection is registered in the form state
  4. Fill out all required text fields: Nome do município: 'São Paulo Teste', Email: 'test@saopaulo.gov.br', Senha: 'TestPassword123!', Nome do facilitador: 'João Silva', Email pra contato: 'contato@saopaulo.gov.br', Custo de entrega no aterro: '250.50', Custo do combustível: '5.75'
    - expect: All fields accept the input values
    - expect: No validation error messages appear during typing
    - expect: Numeric fields accept decimal values properly
  5. Select status as 'Ativo' from radio button options
    - expect: Ativo option is selected
    - expect: Radio button state changes visually
  6. Click the 'Cadastrar' button to submit the form
    - expect: Loading state is activated (button shows loading spinner)
    - expect: Form submission is triggered
    - expect: Success toast message 'Município cadastrado com sucesso!' appears
    - expect: User is redirected to '/municipios' page
    - expect: New municipality appears in the municipalities list

#### 1.2. Validate required field errors when submitting empty form

**File:** `tests/municipios/create-municipality-validation.spec.ts`

**Steps:**
  1. Navigate to the municipality registration page
    - expect: Registration form is displayed
    - expect: All fields are empty
  2. Click 'Cadastrar' button without filling any fields
    - expect: Error toast appears: 'Escolha uma cor'
    - expect: Form is not submitted
    - expect: User remains on registration page
  3. Select a color but don't upload an image, then click 'Cadastrar'
    - expect: Error toast appears: 'Escolha uma imagem'
    - expect: Form is not submitted
  4. Upload an image, select a color, but leave text fields empty, then click 'Cadastrar'
    - expect: Validation error messages appear under empty required fields
    - expect: Email field shows email format validation error if invalid
    - expect: Password field shows password strength validation error
    - expect: Number fields show numeric validation errors if invalid
    - expect: Form is not submitted

#### 1.3. Validate email format and password strength requirements

**File:** `tests/municipios/create-municipality-field-validation.spec.ts`

**Steps:**
  1. Enter invalid email format in Email field (e.g., 'invalid-email')
    - expect: Email validation error message appears
    - expect: Error message indicates proper email format required
  2. Enter weak password in Senha field (e.g., '123')
    - expect: Password validation error message appears
    - expect: Error message indicates password requirements
  3. Enter invalid email format in 'Email pra contato' field
    - expect: Support email validation error message appears
  4. Enter non-numeric values in 'Custo de entrega no aterro' field (e.g., 'abc')
    - expect: Numeric validation error message appears
    - expect: Field indicates numeric value required
  5. Enter non-numeric values in 'Custo do combustível' field
    - expect: Numeric validation error message appears

#### 1.4. Test image upload restrictions and file type validation

**File:** `tests/municipios/create-municipality-image-upload.spec.ts`

**Steps:**
  1. Attempt to upload an unsupported file type (e.g., .pdf, .txt)
    - expect: File is rejected by the file input
    - expect: Only image formats (PNG, JPEG, JPG) are accepted
  2. Upload a valid PNG image file
    - expect: Image preview updates successfully
    - expect: Upload is accepted
  3. Upload a valid JPEG image file
    - expect: Image preview updates successfully
    - expect: Previous image is replaced

#### 1.5. Test navigation and cancel functionality

**File:** `tests/municipios/create-municipality-navigation.spec.ts`

**Steps:**
  1. Fill out partial form data
    - expect: Form fields contain entered data
  2. Click the back arrow (ChevronLeft) in the page title
    - expect: User is navigated back to previous page
    - expect: Form data is not saved
    - expect: No confirmation dialog appears for unsaved changes

### 2. Municipality Registration - Edit Mode

**Seed:** `specs/seed.spec.ts`

#### 2.1. Successfully edit an existing municipality

**File:** `tests/municipios/edit-municipality-success.spec.ts`

**Steps:**
  1. Navigate to the municipality edit page with valid ID (/municipios/cadastrar?id=existing-city-id)
    - expect: Page displays 'Editar município' title
    - expect: Loading state appears while fetching municipality data
    - expect: Form fields are populated with existing municipality data
    - expect: Email and Password fields are hidden in edit mode
    - expect: Current municipality image is displayed
    - expect: Current color selection is highlighted
    - expect: Submit button shows 'Editar' text instead of 'Cadastrar'
  2. Modify municipality name to 'São Paulo Editado'
    - expect: Field accepts the new value
    - expect: Change is reflected in form state
  3. Change facilitator name to 'Maria Santos'
    - expect: Field is updated successfully
  4. Update support email to 'novoemail@saopaulo.gov.br'
    - expect: Field accepts valid email format
  5. Change landfill delivery cost to '300.75'
    - expect: Numeric field accepts decimal value
  6. Update fuel cost to '6.25'
    - expect: Numeric field accepts decimal value
  7. Change color selection from current to blue
    - expect: New color is selected and highlighted
    - expect: Previous color selection is deselected
  8. Change status from 'Ativo' to 'Inativo'
    - expect: Radio button selection changes
    - expect: New status is selected
  9. Click 'Editar' button to save changes
    - expect: Loading state is activated
    - expect: Success toast message 'Município editado com sucesso!' appears
    - expect: User is redirected back to previous page
    - expect: Changes are persisted in the system

#### 2.2. Edit municipality with new image upload

**File:** `tests/municipios/edit-municipality-image.spec.ts`

**Steps:**
  1. Navigate to edit page for existing municipality
    - expect: Current municipality image is displayed
    - expect: Edit form is loaded
  2. Click 'Escolher imagem' button and upload new image
    - expect: Image preview updates to show new image
    - expect: New image file is selected for upload
  3. Submit the form with new image
    - expect: Old image is deleted from storage
    - expect: New image is uploaded and saved
    - expect: Municipality is updated with new image URL
    - expect: Success message appears

#### 2.3. Edit municipality without changing image

**File:** `tests/municipios/edit-municipality-no-image.spec.ts`

**Steps:**
  1. Navigate to edit page for existing municipality
    - expect: Form loads with existing data
    - expect: Current image is displayed
  2. Modify only text fields (name, facilitator, costs) without changing image
    - expect: Text fields are updated
  3. Submit the form
    - expect: Only text data is updated
    - expect: Existing image remains unchanged
    - expect: No image operations are performed
    - expect: Success message appears

#### 2.4. Handle edit mode with invalid municipality ID

**File:** `tests/municipios/edit-municipality-invalid-id.spec.ts`

**Steps:**
  1. Navigate to edit page with non-existent municipality ID (/municipios/cadastrar?id=invalid-id)
    - expect: Loading state appears initially
    - expect: Error handling occurs for non-existent municipality
    - expect: Page handles the error gracefully
    - expect: User receives appropriate feedback

### 3. Municipality Registration - Error Scenarios

**Seed:** `specs/seed.spec.ts`

#### 3.1. Handle authentication creation failure

**File:** `tests/municipios/create-municipality-auth-error.spec.ts`

**Steps:**
  1. Fill out complete valid form with email that already exists in the system
    - expect: Form is filled correctly
  2. Submit the form
    - expect: Authentication creation fails
    - expect: Error toast appears with authentication error message
    - expect: User remains on registration page
    - expect: Form data is preserved

#### 3.2. Handle network errors during submission

**File:** `tests/municipios/create-municipality-network-error.spec.ts`

**Steps:**
  1. Fill out complete valid form
    - expect: Form is ready for submission
  2. Simulate network failure and submit form
    - expect: Loading state ends
    - expect: Error toast appears with network error message
    - expect: User can retry the operation
    - expect: Form data is preserved

#### 3.3. Handle image upload failures

**File:** `tests/municipios/create-municipality-image-error.spec.ts`

**Steps:**
  1. Fill out form with valid data and upload an image
    - expect: Form is ready with image
  2. Simulate image upload service failure during form submission
    - expect: Image upload fails gracefully
    - expect: Error message is displayed
    - expect: User can retry with different image
    - expect: Form data is preserved

### 4. Municipality Registration - User Experience

**Seed:** `specs/seed.spec.ts`

#### 4.1. Test form responsiveness and loading states

**File:** `tests/municipios/municipality-ux.spec.ts`

**Steps:**
  1. Navigate to registration page
    - expect: Page loads without layout shift
    - expect: All elements are properly positioned
  2. Fill out form and submit
    - expect: Submit button shows loading state during submission
    - expect: Form fields remain disabled during submission
    - expect: Loading indicator provides visual feedback
  3. Test form on mobile viewport (simulate mobile device)
    - expect: Form layout adapts to mobile screen size
    - expect: All elements remain accessible and usable
    - expect: Touch interactions work properly for image upload and color selection

#### 4.2. Test accessibility features

**File:** `tests/municipios/municipality-accessibility.spec.ts`

**Steps:**
  1. Navigate registration page using keyboard only
    - expect: All form elements are reachable via Tab navigation
    - expect: Focus indicators are visible
    - expect: Color selection grid is keyboard accessible
    - expect: Image upload button is keyboard accessible
  2. Test screen reader compatibility
    - expect: Form labels are properly associated with inputs
    - expect: Error messages are announced by screen readers
    - expect: Required field indicators are accessible
    - expect: Button states (loading, disabled) are announced
