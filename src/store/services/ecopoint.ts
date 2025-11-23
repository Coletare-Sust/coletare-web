const API_URL =
  process.env.NEXT_PUBLIC_API_ECOTOOLS_URL ||
  "http://127.0.0.1:5001/coletare-60241/us-central1/ecoponto";

export type Ecoponto = {
  id: string;
  cityId: string;
  name: string;
  description: string;
  residueType: string[];
  lat: number;
  lng: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateEcopontoDTO = {
  cityId: string;
  name: string;
  description: string;
  residueType: string[];
  lat: number;
  lng: number;
  isActive: boolean;
};

export type UpdateEcopontoDTO = Partial<CreateEcopontoDTO>;

async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API ERROR:", errorText);

    throw new Error(`Erro na requisição: ${res.status} - ${errorText}`);
  }

  return res.json() as Promise<T>;
}

export const createEcoponto = (data: CreateEcopontoDTO) => {
  console.log("Enviando dados para criação:", data);

  return http<Ecoponto>(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const updateEcoponto = (id: string, data: UpdateEcopontoDTO) => {
  return http<Ecoponto>(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const deleteEcoponto = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API ERROR:", errorText);
    throw new Error(`Erro ao excluir: ${res.status} - ${errorText}`);
  }

  return true;
};

export const getEcopontoById = (id: string) => {
  return http<Ecoponto>(`${API_URL}/${id}`);
};

export const getEcopontosByCity = (cityId: string) => {
  return http<Ecoponto[]>(`${API_URL}/city/${cityId}`);
};
