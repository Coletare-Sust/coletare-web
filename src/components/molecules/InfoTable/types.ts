import { WithdrawalsRequestEntity } from "@/common/entities/WithdrawalsRequest";

export interface Extended extends WithdrawalsRequestEntity {
  onClick: () => void;
}

export interface InfoTableProps {
  data: Extended[] | undefined;
}
