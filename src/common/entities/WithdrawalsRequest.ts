import { Timestamp } from "firebase/firestore";

export interface WithdrawalsRequestEntity {
  type: "residence" | "inappropriate-location";
  id: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  residueType: string;
  createdById: string;
  createdAt: Timestamp;
  isResolved: boolean;
}
