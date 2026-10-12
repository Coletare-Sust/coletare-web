import type { Timestamp } from "@/common/entities/timestamp";
import { ColorsOptions } from "./colors";

export interface UserEntity {
  id: string;
  name: string;
  role: "admin" | "vehicle" | "employee" | "citizen" | "platformAdmin";
  email: string | null;
  image: string | null;
  supportEmail: string | null;
  cityId: string | null;
  facilitatorName: string | null;
  color: ColorsOptions | null;
  carPlate: string | null;
  cpf: string | null;
  consume: string | null;
  emission: string | null;
  fullAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  calcData: {
    fuel: number | null;
    landfillDelivery: number | null;
    initialDate: Timestamp; // não pode ser null
  };
  tokens?: string[];
  status?: string;
  permissions?: string[];
}
