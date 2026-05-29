import { apiFetch } from "@/utils/apiFetch";
import { UserEntity } from "@common/entities/user";
import { normalizeUserRole } from "@/common/mappers/backendEnums";

// ---------- Backend Output DTOs ----------

interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  tokens: string[] | null;
  image?: string | null;
  color?: string | null;
}

interface VehicleEfficiencyDTO {
  consume: number;
  emission: number;
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

interface CityOutputDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
  calcData: CalcDataDTO | null;
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
  cityId: string;
  email?: string;
  password?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

// normalizeRole usa o mapper centralizado de enums do backend
const normalizeRole = normalizeUserRole;

// ---------- Mappers ----------

function mapUserResponseToEntity(dto: UserResponseDTO): UserEntity {
  const role = normalizeRole(dto.role);
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    role,
    image: dto.image ?? null,
    supportEmail: null,
    // Para admin (City), o próprio id é o cityId
    cityId: role === "admin" ? dto.id : null,
    facilitatorName: null,
    color: (dto.color as any) ?? null,
    carPlate: null,
    cpf: null,
    consume: null,
    emission: null,
    fullAddress: null,
    latitude: null,
    longitude: null,
    createdAt: null as any,
    updatedAt: null as any,
    calcData: { fuel: null, landfillDelivery: null, initialDate: null as any },
    tokens: dto.tokens ?? [],
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
    fullAddress: null,
    latitude: null,
    longitude: null,
    createdAt: null as any,
    updatedAt: null as any,
    calcData: { fuel: null, landfillDelivery: null, initialDate: null as any },
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
    calcData: { fuel: null, landfillDelivery: null, initialDate: null as any },
  };
}

function mapCityOutputToEntity(dto: CityOutputDTO): UserEntity {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    role: "admin",
    image: dto.imageUrl ?? null,
    supportEmail: null,
    // Para cidade, cityId = id
    cityId: dto.id,
    facilitatorName: null,
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
      initialDate: null as any,
    },
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

export const getUser = async (id: string | null): Promise<UserEntity | null> => {
  if (!id) return null;
  try {
    const data = await apiFetch<UserResponseDTO>(`/user/${id}`);
    return mapUserResponseToEntity(data);
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
    const data = await apiFetch<VehicleOutputDTO[]>(`/user/${cityId}/city/vehicles`);
    return data.map(mapVehicleOutputToEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const getAllCollaborators = async (cityId: string): Promise<UserEntity[]> => {
  try {
    const data = await apiFetch<EmployeeOutputDTO[]>(`/user/${cityId}/city/employees`);
    return data.map(mapEmployeeOutputToEntity);
  } catch (error: any) {
    console.error(error);
    return [];
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

export const getAllCitizens = async (_cityId: string): Promise<UserEntity[]> => {
  try {
    const data = await apiFetch<UserResponseDTO[]>(`/user/${_cityId}/city/citizens`);
    return data.map(mapUserResponseToEntity);
  } catch (error) {
    console.error(error);
    return [];
  }
};

/** Cria colaborador, veículo, cidadão ou cidade via endpoint correto */
export const createUser = async (
  data: Partial<UserEntity>,
  _image?: File | null
): Promise<{ error: string | null }> => {
  try {
    const role = data.role;

    if (role === "employee") {
      await apiFetch("/auth/register/employee", {
        method: "POST",
        body: JSON.stringify({ name: data.name, cpf: data.cpf, cityId: data.cityId }),
      });
    } else if (role === "vehicle") {
      await apiFetch("/auth/register/vehicle", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          carPlate: data.carPlate,
          consume: parseFloat(data.consume ?? "0"),
          emission: parseFloat(data.emission ?? "0"),
          cityId: data.cityId,
        }),
      });
    } else if (role === "citizen") {
      await apiFetch("/auth/register/citizen", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } else if (role === "admin") {
      await apiFetch("/auth/register/city", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

/** Alias mantido para compatibilidade com telas existentes */
export const createUserDoc = createUser;

export const updateUser = async (
  id: string,
  data: Partial<UserEntity>
): Promise<{ error: string | null }> => {
  try {
    const input: UpdateUserInput = {
      name: data.name,
      email: data.email ?? undefined,
    };
    await apiFetch(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

/** Alias mantido para compatibilidade com telas existentes */
export const updateUserDoc = updateUser;

export const deleteUser = async (id: string): Promise<{ error: string | null }> => {
  try {
    await apiFetch(`/user/${id}`, { method: "DELETE" });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

/** Alias mantido para compatibilidade com telas existentes */
export const deleteUserDoc = deleteUser;
