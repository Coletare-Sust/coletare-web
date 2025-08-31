import { Timestamp } from "firebase/firestore";

export interface WarningEntity {
  id: string;
  userId: string;
  title: string;
  description: string;
  image: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
