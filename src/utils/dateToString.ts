export const dateToShortString = (date: Date): string => {
  return date
    ? date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "Invalid date";
};
