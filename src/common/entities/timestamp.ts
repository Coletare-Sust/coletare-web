export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export const dateToTimestamp = (date: Date): Timestamp => {
  const milliseconds = date.getTime();
  const seconds = Math.floor(milliseconds / 1000);

  return { seconds, nanoseconds: (milliseconds - seconds * 1000) * 1000000 };
};
