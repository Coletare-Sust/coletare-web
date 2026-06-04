export interface WithdrawalsRequestEntity {
  type: "residence" | "inappropriate-location";
  id: string;
  cityId: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  residueType: string;
  createdById: string;
  createdAt: { seconds: number; nanoseconds: number; toDate: () => Date };
  isResolved: boolean;
  image: string | null;
}
