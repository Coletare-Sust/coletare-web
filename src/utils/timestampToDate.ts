import { Timestamp } from "@/common/entities/timestamp";

export const timestampToDate = (data: Timestamp): Date => {
  const milliseconds = data.seconds * 1000 + data.nanoseconds / 1000000;
  return new Date(milliseconds);
};
