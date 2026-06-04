export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}
