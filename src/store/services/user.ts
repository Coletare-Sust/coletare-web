import { UserEntity } from "@common/entities/user";

const API_BASE =
  process.env.NEXT_PUBLIC_API_USERS_URL || "http://localhost:8080/bff/users";

async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

interface BackendUser {
  id: string;
  externalId?: string;
  email: string;
  displayName: string;
  cityId?: string | null;
  roles?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Converte ISO string em objeto Timestamp compatível com { seconds, nanoseconds, toDate }
function toTimestamp(value?: string | null | { seconds: number; nanoseconds: number }) {
  if (!value) {
    return { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) };
  }
  if (typeof value === "object" && "seconds" in value) {
    return { ...value, toDate: () => new Date((value as any).seconds * 1000) };
  }
  const ms = new Date(value as string).getTime();
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
    toDate: () => new Date(ms)
  };
}

function toUserEntity(u: BackendUser): UserEntity {
  const meta = u.metadata || {};
  return {
    id: u.id,
    name: u.displayName || meta.name || "",
    role: ((u.roles?.[0] || meta.role || "citizen").toLowerCase()) as UserEntity["role"],
    email: u.email ?? null,
    image: meta.image ?? null,
    supportEmail: meta.supportEmail ?? null,
    cityId: u.cityId ?? null,
    facilitatorName: meta.facilitatorName ?? null,
    color: meta.color ?? null,
    carPlate: meta.carPlate ?? null,
    cpf: meta.cpf ?? null,
    consume: meta.consume ?? null,
    emission: meta.emission ?? null,
    fullAddress: meta.fullAddress ?? null,
    latitude: meta.latitude ?? null,
    longitude: meta.longitude ?? null,
    createdAt: toTimestamp(u.createdAt) as any,
    updatedAt: toTimestamp(u.updatedAt) as any,
    calcData: {
      fuel: meta.calcData?.fuel ?? null,
      landfillDelivery: meta.calcData?.landfillDelivery ?? null,
      initialDate: toTimestamp(meta.calcData?.initialDate) as any
    },
    tokens: meta.tokens ?? [],
    status: meta.status
  };
}

// Converte Timestamp { seconds, toDate } ou ISO string para ISO string
function timestampToIso(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  return null;
}

function toBackendPayload(data: Partial<UserEntity> & { id?: string }) {
  const {
    id, name, email, role, cityId, image, carPlate, cpf, consume,
    emission, supportEmail, facilitatorName, color, fullAddress,
    latitude, longitude, calcData, tokens, status
  } = data;

  return {
    id,
    email: email || null,
    displayName: name || "",
    cityId: cityId ?? null,
    roles: role ? [role.toUpperCase()] : [],
    metadata: {
      image: typeof image === "string" ? image : null,
      carPlate: carPlate ?? null,
      cpf: cpf ?? null,
      consume: consume ?? null,
      emission: emission ?? null,
      supportEmail: supportEmail ?? null,
      facilitatorName: facilitatorName ?? null,
      color: color ?? null,
      fullAddress: fullAddress ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      calcData: calcData
        ? {
            fuel: calcData.fuel ?? null,
            landfillDelivery: calcData.landfillDelivery ?? null,
            initialDate: timestampToIso(calcData.initialDate)
          }
        : null,
      tokens: tokens ?? [],
      status: status ?? null
    }
  };
}

export const createUserDoc = async (data: UserEntity) => {
  try {
    await http(`${API_BASE}`, {
      method: "POST",
      body: JSON.stringify(toBackendPayload(data))
    });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { errorDoc: error.message };
  }
};

export const getUsers = async (): Promise<UserEntity[]> => {
  try {
    const users = await http<BackendUser[]>(`${API_BASE}`);
    return users.map(toUserEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const createUser = async (data: UserEntity, _image?: File | null) => {
  try {
    // Upload de imagem para MinIO ainda não implementado.
    // Se data.image for uma string (URL), é preservada via toBackendPayload.
    await http(`${API_BASE}`, {
      method: "POST",
      body: JSON.stringify(toBackendPayload(data))
    });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getUser = async (uid: string | null): Promise<UserEntity | null> => {
  if (!uid) return null;
  try {
    const user = await http<BackendUser>(`${API_BASE}/${uid}`);
    return toUserEntity(user);
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getAllVehicles = async (cityId: string): Promise<UserEntity[]> => {
  try {
    const users = await http<BackendUser[]>(
      `${API_BASE}?cityId=${encodeURIComponent(cityId)}&role=vehicle`
    );
    return users.map(toUserEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const deleteUser = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getAllCollaborators = async (cityId: string): Promise<UserEntity[]> => {
  try {
    const users = await http<BackendUser[]>(
      `${API_BASE}?cityId=${encodeURIComponent(cityId)}&role=employee`
    );
    return users.map(toUserEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

// Faz GET do estado atual, merge com os dados parciais e reenvia (upsert)
export const updateUserDoc = async (uid: string, data: Partial<UserEntity>) => {
  try {
    const current = await http<BackendUser>(`${API_BASE}/${uid}`);
    const merged = { ...toUserEntity(current), ...data, id: uid };
    await http(`${API_BASE}`, {
      method: "POST",
      body: JSON.stringify(toBackendPayload(merged))
    });
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateUser = async (id: string, data: Partial<UserEntity>) => {
  return updateUserDoc(id, data);
};

export const deleteUserDoc = async (uid: string) => {
  try {
    const res = await fetch(`${API_BASE}/${uid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { errorDoc: error.message };
  }
};

export const getAllCities = async (): Promise<UserEntity[]> => {
  try {
    const users = await http<BackendUser[]>(`${API_BASE}?role=admin`);
    return users.map(toUserEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const getAllCitizens = async (cityId: string): Promise<UserEntity[]> => {
  try {
    const users = await http<BackendUser[]>(
      `${API_BASE}?cityId=${encodeURIComponent(cityId)}&role=citizen`
    );
    return users.map(toUserEntity);
  } catch (error: any) {
    console.error(error);
    return [];
  }
};
