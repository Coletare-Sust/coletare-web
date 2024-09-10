import { monthsArray } from "@/common/constants/chartData";

export const getYear = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const last12Months = [];

  for (let i = 0; i < 12; i++) {
    const aux = (currentMonth - i + 12) % 12;
    last12Months.unshift(monthsArray[aux]);
  }
  return last12Months;
};

export const getSemester = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const last6Months = [];

  for (let i = 0; i <= 5; i++) {
    const aux = (currentMonth - i + 12) % 12;
    last6Months.unshift(monthsArray[aux]);
  }
  return last6Months;
};

export const getDays = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const totalDaysInMonth = lastDayOfMonth.getDate();

  const days = Array.from({ length: totalDaysInMonth }).map((_, index) =>
    (index + 1).toString()
  );

  return days;
};
