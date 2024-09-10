export interface DashboardEntity {
  landfill: {
    year: number[];
    semester: number[];
    month: number[];
  };
  fuel: {
    year: number[];
    semester: number[];
    month: number[];
  };
  emission: {
    year: number[];
    semester: number[];
    month: number[];
  };
  mass: {
    year: number[];
    semester: number[];
    month: number[];
  };
}
