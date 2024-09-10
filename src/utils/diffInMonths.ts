export function diffInMonths(date1: Date, date2: Date): number {
  const yearDiff = date2.getFullYear() - date1.getFullYear();
  const monthDiff = date2.getMonth() - date1.getMonth();
  const dayDiff = date2.getDate() - date1.getDate();

  let diff = yearDiff * 12 + monthDiff;
  if (dayDiff < 0) {
    diff--;
  }
  return diff;
}
