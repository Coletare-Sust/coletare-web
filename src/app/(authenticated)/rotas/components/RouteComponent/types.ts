import { RouteEntity } from "@/common/entities/route";

export interface RouteProps {
  closeItem: () => void;
  route: RouteEntity;
  routeDays: string;
  isAdmin: boolean;
}
