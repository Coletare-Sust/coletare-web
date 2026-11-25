import { apiFetch } from "@/utils/apiFetch";

// ---------- Backend DTOs (BiomassOutputDTO / BiomassDraftOutputDTO) ----------

export type BiomassMaterial =
  | "FOOD"
  | "GARDEN"
  | "PAPER"
  | "WOOD"
  | "TEXTILE"
  | "OTHER";

export type FuelType =
  | "DIESEL"
  | "DIESEL_S10"
  | "GASOLINE"
  | "ETHANOL"
  | "BIODIESEL";

export type FuelSource = "ESTIMATED" | "MEASURED";

interface AddressDTO {
  fullAddress: string;
  location: { latitude: number; longitude: number };
}

export interface BiomassOutput {
  items: {
    material: BiomassMaterial;
    materialDescription: string;
    massKg: number;
  }[];
  totalKg: number;
  origin: AddressDTO;
  destination: {
    siteId: string;
    name: string;
    type: string;
    typeDescription: string;
    address: AddressDTO;
  };
  collectedAt: string;
  deliveredAt: string;
  fuel: {
    type: FuelType;
    typeDescription: string;
    liters: number;
    source: FuelSource;
  } | null;
  registeredBy: string;
  registeredAt: string;
  updatedAt: string;
}

export interface BiomassDraft {
  collectedAt: string | null;
  deliveredAt: string | null;
  estimatedFuelLiters: number | null;
  suggestedOrigin: {
    fullAddress: string;
    latitude: number;
    longitude: number;
    geocoded: boolean;
  } | null;
  hasBiomass: boolean;
}

export interface RegisterBiomassInput {
  items: { material: BiomassMaterial; massKg: number }[];
  origin: AddressDTO;
  destinationSiteId: string;
  collectedAt: string;
  deliveredAt: string;
  /** Sem `liters` o backend estima (consumo L/km x km rodados). */
  fuel?: { type: FuelType; liters?: number } | null;
}

// ---------- Services ----------

/** Devolve null quando a coleta ainda não tem biomassa (404). */
export const getCollectBiomass = async (
  collectId: string
): Promise<BiomassOutput | null> => {
  try {
    return await apiFetch<BiomassOutput>(`/collect/${collectId}/biomass`);
  } catch (error: any) {
    if (String(error?.message).includes("404")) return null;
    // O backend devolve 404 com mensagem própria; sem biomassa não é erro de tela.
    if (/biomassa|biomass|encontrad|not found/i.test(error?.message ?? "")) {
      return null;
    }
    throw error;
  }
};

export const getBiomassDraft = (collectId: string) =>
  apiFetch<BiomassDraft>(`/collect/${collectId}/biomass/draft`);

export const registerCollectBiomass = (
  collectId: string,
  input: RegisterBiomassInput
) =>
  apiFetch<BiomassOutput>(`/collect/${collectId}/biomass`, {
    method: "PUT",
    body: JSON.stringify(input)
  });

export const removeCollectBiomass = async (collectId: string) => {
  await apiFetch(`/collect/${collectId}/biomass`, { method: "DELETE" });
};
