import { apiFetch } from "@/utils/apiFetch";
import { UserEntity } from "@common/entities/user";
import { normalizeUserRole } from "@/common/mappers/backendEnums";
import { normalizePermission } from "@/common/accessControl/permissions";
import { PageEntity } from "@/common/entities/pagination";

// ---------- Backend Output DTOs ----------

interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  tokens: string[] | null;
  image?: string | null;
  color?: string | null;
  // Vehicle fields
  carPlate?: string | null;
  efficiency?: {
    consume: number;
    emission: number;
    fuelType?: string | null;
  } | null;
  // Employee / Citizen fields
  cpf?: string | null;
  // City / general fields
  cityId?: string | null;
  facilitatorName?: string | null;
  supportEmail?: string | null;
  calcData?: {
    fuel: number | null;
    landFillDelivery: number | null;
  } | null;
  status?: boolean | null;
  permissions?: string[] | null;
  scope?: string | null;
  address?: {
    fullAddress: string;
    location: {
      latitude: number;
      longitude: number;
    } | null;
  } | null;
}

interface VehicleEfficiencyDTO {
  consume: number;
  emission: number;
  fuelType?: string | null;
}

interface VehicleOutputDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  carPlate: string;
  efficiency: VehicleEfficiencyDTO;
}

interface EmployeeOutputDTO {
  id: string;
  name: string;
  role: string;
  cpf: string;
}

interface CalcDataDTO {
  fuel: number | null;
  landFillDelivery: number | null;
  initialDate: string | null;
}

interface CityResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  calcData: CalcDataDTO | null;
  facilitatorName: string | null;
  supportEmail: string | null;
  address: {
    fullAddress: string;
    location: {
      latitude: number;
      longitude: number;
    } | null;
  } | null;
  status: boolean;
  color: string | null;
}

interface CityOutputDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
  calcData: CalcDataDTO | null;
  facilitatorName?: string | null;
  supportEmail?: string | null;
}

interface PageOutputDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ---------- Input DTOs ----------

export interface CreateEmployeeInput {
  name: string;
  cpf: string;
  cityId: string;
  email?: string;
  password?: string;
}

export interface CreateVehicleInput {
  name: string;
  carPlate: string;
  consume: string;
  emission: string;
  fuelType?: string;
  cityId: string;
  email?: string;
  password?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  cpf?: string;
  carPlate?: string;
  consume?: number;
  emission?: number;
  fuelType?: string;
}

// normalizeRole usa o mapper centralizado de enums do backend
const normalizeRole = normalizeUserRole;

function extractPermissions(dto: UserResponseDTO) {
  const rawPermissions = dto.permissions?.length
    ? dto.permissions
    : dto.scope?.split(" ") ?? [];

  return rawPermissions
    .map(normalizePermission)
    .filter((permission) => permission.length > 0);
}

// ---------- Mappers ----------

function mapUserResponseToEntity(dto: UserResponseDTO): UserEntity {
  const role = normalizeRole(dto.role);
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    role,
    image: dto.image ?? null,
    supportEmail: dto.supportEmail ?? null,
    // Para admin (City), o próprio id é o cityId; para outros, usa cityId do DTO
    cityId: role === "admin" ? dto.id : dto.cityId ?? null,
    facilitatorName: dto.facilitatorName ?? null,
    color: (dto.color as any) ?? null,
    carPlate: dto.carPlate ?? null,
    cpf: dto.cpf ?? null,
    consume: dto.efficiency?.consume?.toString() ?? null,
    emission: dto.efficiency?.emission?.toString() ?? null,
    fuelType: dto.efficiency?.fuelType ?? null,
    fullAddress: dto.address?.fullAddress ?? null,
    latitude: dto.address?.location?.latitude ?? null,
    longitude: dto.address?.location?.longitude ?? null,
    createdAt: null as any,
    updatedAt: null as any,
    calcData: {
      fuel: dto.calcData?.fuel ?? null,
      landfillDelivery: dto.calcData?.landFillDelivery ?? null,
      initialDate: null as any
    },
    tokens: dto.tokens ?? [],
    // Converte o boolean do backend para string 'Ativo'/'Inativo'
    status:
      dto.status === true
        ? "Ativo"
        : dto.status === false
        ? "Inativo"
        : undefined,
    permissions: extractPermissions(dto)
  };
}

function mapVehicleOutputToEntity(dto: VehicleOutputDTO): UserEntity {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    role: "vehicle",
    image: null,
    supportEmail: null,
    cityId: null,
    facilitatorName: null,
    color: null,
    carPlate: dto.carPlate ?? null,
    cpf: null,
    consume: dto.efficiency?.consume?.toString() ?? null,
    emission: dto.efficiency?.emission?.toString() ?? null,
    fuelType: dto.efficiency?.fuelType ?? null,
    fullAddress: null,
    latitude: null,
    longitude: null,
    createdAt: null as any,
    updatedAt: null as any,
    calcData: { fuel: null, landfillDelivery: null, initialDate: null as any }
  };
}

function mapEmployeeOutputToEntity(dto: EmployeeOutputDTO): UserEntity {
  return {
    id: dto.id,
    name: dto.name,
    email: null,
    role: "employee",
    image: null,
    supportEmail: null,
    cityId: null,
    facilitatorName: null,
    color: null,
    carPlate: null,
    cpf: dto.cpf ?? null,
    consume: null,
    emission: null,
    fullAddress: null,
    latitude: null,
    longitude: null,
    createdAt: null as any,
    updatedAt: null as any,
    calcData: { fuel: null, landfillDelivery: null, initialDate: null as any }
  };
}

function mapCityOutputToEntity(dto: CityOutputDTO): UserEntity {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    role: "admin",
    image: dto.imageUrl ?? null,
    supportEmail: dto.supportEmail ?? null,
    // Para cidade, cityId = id
    cityId: dto.id,
    facilitatorName: dto.facilitatorName ?? null,
    color: null,
    carPlate: null,
    cpf: null,
    consume: null,
    emission: null,
    fullAddress: null,
    latitude: null,
    longitude: null,
    createdAt: null as any,
    updatedAt: null as any,
    calcData: {
      fuel: dto.calcData?.fuel ?? null,
      landfillDelivery: dto.calcData?.landFillDelivery ?? null,
      initialDate: null as any
    }
  };
}

function mapCityResponseToEntity(dto: CityResponseDTO): UserEntity {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    role: "admin",
    image: dto.image ?? null,
    supportEmail: dto.supportEmail ?? null,
    cityId: dto.id,
    facilitatorName: dto.facilitatorName ?? null,
    color: (dto.color as any) ?? null,
    carPlate: null,
    cpf: null,
    consume: null,
    emission: null,
    fullAddress: dto.address?.fullAddress ?? null,
    latitude: dto.address?.location?.latitude ?? null,
    longitude: dto.address?.location?.longitude ?? null,
    createdAt: null as any,
    updatedAt: null as any,
    calcData: {
      fuel: dto.calcData?.fuel ?? null,
      landfillDelivery: dto.calcData?.landFillDelivery ?? null,
      initialDate: null as any
    },
    status: dto.status ? "Ativo" : "Inativo"
  };
}

// ---------- Services ----------

/**
 * Busca o perfil do usuário autenticado via /auth/me (dados do JWT).
 * Retorna role normalizado e cityId preenchido corretamente.
 * Usar este service no useProfile para o usuário logado.
 */
export const getMe = async (): Promise<UserEntity | null> => {
  try {
    const data = await apiFetch<UserResponseDTO>("/auth/me");
    return mapUserResponseToEntity(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUser = async (
  id: string | null
): Promise<UserEntity | null> => {
  if (!id) return null;
  try {
    const data = await apiFetch<UserResponseDTO>(`/user/${id}`);
    return mapUserResponseToEntity(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getCityById = async (
  id: string | null
): Promise<UserEntity | null> => {
  if (!id) return null;
  try {
    const data = await apiFetch<CityResponseDTO>(`/user/${id}/city`);
    console.log(data);
    return mapCityResponseToEntity(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUsers = async (): Promise<UserEntity[]> => {
  try {
    const data = await apiFetch<UserResponseDTO[]>("/user/all");
    return data.map(mapUserResponseToEntity);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAllVehicles = async (cityId: string): Promise<UserEntity[]> => {
  try {
    const data = await apiFetch<VehicleOutputDTO[]>(
      `/user/${cityId}/city/vehicles`
    );
    return data.map(mapVehicleOutputToEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const getVehiclesPage = async (
  cityId: string,
  page = 0,
  size = 10,
  filters?: { name?: string; carPlate?: string }
): Promise<PageEntity<UserEntity> | null> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    if (filters?.name?.trim()) params.set("name", filters.name.trim());
    if (filters?.carPlate?.trim())
      params.set("carPlate", filters.carPlate.trim());

    const data = await apiFetch<PageOutputDTO<VehicleOutputDTO>>(
      `/user/${cityId}/city/vehicles/page?${params.toString()}`
    );

    return { ...data, content: data.content.map(mapVehicleOutputToEntity) };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllCollaborators = async (
  cityId: string
): Promise<UserEntity[]> => {
  try {
    const data = await apiFetch<EmployeeOutputDTO[]>(
      `/user/${cityId}/city/employees`
    );
    return data.map(mapEmployeeOutputToEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const getCollaboratorsPage = async (
  cityId: string,
  page = 0,
  size = 10,
  filters?: { name?: string }
): Promise<PageEntity<UserEntity> | null> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    if (filters?.name?.trim()) params.set("name", filters.name.trim());

    const data = await apiFetch<PageOutputDTO<EmployeeOutputDTO>>(
      `/user/${cityId}/city/employees/page?${params.toString()}`
    );

    return { ...data, content: data.content.map(mapEmployeeOutputToEntity) };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllCities = async (): Promise<UserEntity[]> => {
  try {
    const data = await apiFetch<CityOutputDTO[]>("/user/all-cities");
    return data.map(mapCityOutputToEntity);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCitiesPage = async (
  page = 0,
  size = 10,
  filters?: { name?: string }
): Promise<PageEntity<UserEntity> | null> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    if (filters?.name?.trim()) params.set("name", filters.name.trim());

    const data = await apiFetch<PageOutputDTO<CityOutputDTO>>(
      `/user/all-cities/page?${params.toString()}`
    );

    return { ...data, content: data.content.map(mapCityOutputToEntity) };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllCitizens = async (
  _cityId: string,
  init?: RequestInit
): Promise<UserEntity[]> => {
  try {
    const data = await apiFetch<UserResponseDTO[]>(
      `/user/${_cityId}/city/citizens`,
      init
    );
    return data.map(mapUserResponseToEntity);
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Cria colaborador, veículo, cidadão ou cidade via endpoint correto.
 * Lança em erro HTTP para que a mutation caia em onError.
 */
export const createUser = async (
  data: Partial<UserEntity>,
  _image?: File | null
): Promise<void> => {
  const role = data.role;

  if (role === "employee") {
    await apiFetch("/auth/register/employee", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        cpf: data.cpf,
        cityId: data.cityId
      })
    });
  } else if (role === "vehicle") {
    await apiFetch("/auth/register/vehicle", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        carPlate: data.carPlate,
        consume: parseFloat(data.consume ?? "0"),
        emission: parseFloat(data.emission ?? "0"),
        cityId: data.cityId
      })
    });
  } else if (role === "citizen") {
    await apiFetch("/auth/register/citizen", {
      method: "POST",
      body: JSON.stringify(data)
    });
  } else if (role === "admin") {
    // Backend espera multipart/form-data com part 'data' (JSON) e 'image' opcional
    const formData = new FormData();
    const cityPayload = {
      municipalityName: data.name,
      email: data.email,
      password: (data as any).password,
      facilitatorData: {
        facilitatorName: data.facilitatorName,
        supportEmail: data.supportEmail
      },
      calcData: {
        landFillDeliveryCost: data.calcData?.landfillDelivery ?? null,
        fuelCost: data.calcData?.fuel ?? null
      },
      address: {
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        localityName: data.fullAddress ?? null
      },
      status: (data as any).status === "Ativo",
      color: data.color ?? null
    };
    formData.append(
      "data",
      new Blob([JSON.stringify(cityPayload)], { type: "application/json" })
    );
    if (_image) {
      formData.append("image", _image);
    }
    await apiFetch("/auth/register/city", {
      method: "POST",
      body: formData
    });
  }
};

/** Alias mantido para compatibilidade com telas existentes */
export const createUserDoc = createUser;

/**
 * O backend (UpdateUserInput) só aceita name, email, cityId, cpf, carPlate, consume e emission;
 * outros campos (calcData, cor, endereço, status, imagem, facilitador) são ignorados.
 * Lança em erro HTTP para que a mutation caia em onError.
 */
export const updateUser = async (
  id: string,
  data: Partial<UserEntity>
): Promise<void> => {
  const input: UpdateUserInput = {
    name: data.name,
    email: data.email ?? undefined,
    cpf: data.cpf ?? undefined,
    carPlate: data.carPlate ?? undefined,
    consume: data.consume ? parseFloat(data.consume) : undefined,
    emission: data.emission ? parseFloat(data.emission) : undefined,
    fuelType: data.fuelType || undefined
  };
  await apiFetch(`/user/${id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
};

/** Alias mantido para compatibilidade com telas existentes */
export const updateUserDoc = updateUser;

export const deleteUser = async (id: string): Promise<void> => {
  await apiFetch(`/user/${id}`, { method: "DELETE" });
};

/** Alias mantido para compatibilidade com telas existentes */
export const deleteUserDoc = deleteUser;
