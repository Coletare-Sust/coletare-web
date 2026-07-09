# Spec: Migração de Usuários (Users/Employees/Vehicles) — Firebase → Backend REST

## Contexto

A gestão de usuários é centralizada em `user.ts` e antes lia e escrevia dados diretamente no Firebase (`users/*`). No novo design do backend (`access` module), as operações de cadastro acontecem pelo módulo `auth` e consultas no `user`.

## 1. Consultas (GET)

Substituir o `get()` do firebase pelas chamadas `apiFetch`:

* `getAllVehicles(cityId)` 
  * → **Chamar:** `GET /user/{cityId}/city/vehicles`
* `getAllCollaborators(cityId)`
  * → **Chamar:** `GET /user/{cityId}/city/employees`
* `getAllCities()`
  * → **Chamar:** `GET /user/all-cities` (apenas perfis com permissão apropriada)
* `getAllCitizens(cityId)`
  * → **Pendencia no backend** criar `GET /user/{cityId}/city/citizens` (se cidadãos precisarem ser listados na dashboard) ou usar o `GET /user/all` e filtrar.
* `getUser(id)`
  * → **Chamar:** `GET /user/{id}`

## 2. Criação (POST)

Substituir o `set()` do firebase pelas rotas de registro específicas:

* Criação de Colaborador (Employee) → `POST /auth/register/employee`
* Criação de Veículo (Vehicle) → `POST /auth/register/vehicle`
* Criação de Cidade (City) → `POST /auth/register/city` (multipart/form-data)
* Criação de Cidadão (Citizen) → `POST /auth/register/citizen`

## 3. Deleção (DELETE)

* `deleteUser(id)` / `deleteUserDoc(uid)`
  * → **Chamar:** `DELETE /user/{id}`

## 4. Atualização (PUT)

* `updateUser(id, data)` / `updateUserDoc(uid, data)`
  * → **Chamar:** `PUT /user/{id}` passando no body os dados.
  * > [!IMPORTANT]
    > O backend agora requer um payload específico contendo { name, email, etc. }. O frontend não deve enviar o objeto de Entidade inteiro, apenas o DTO adequado (ex: propriedades de imagem devem ir via endpoint específico, se necessário).
