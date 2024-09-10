import { monthsArray } from "@/common/constants/chartData";
import { CollectEntity } from "@/common/entities/Collect";
import { Timestamp } from "@/common/entities/timestamp";
import { timestampToDate } from "@/utils/timestampToDate";

export const getAnualDataArray = (collects: CollectEntity[]) => {
  const anualData = monthsArray.map((month) => {
    const monthCollects = collects.filter(
      (collect) =>
        timestampToDate(collect.createdAt as Timestamp).getMonth() ===
        monthsArray.indexOf(month)
    );
    const totalMass = monthCollects.reduce(
      (acc, collect) => acc + (collect.mass as number),
      0
    );
    const totalLandfillCosts = monthCollects.reduce(
      (acc, collect) => acc + (collect.cost?.landfillDelivery as number),
      0
    );
    const totalFuel = monthCollects.reduce(
      (acc, collect) => acc + (collect.cost?.fuel as number),
      0
    );
    const totalEmissions = monthCollects.reduce(
      (acc, collect) => acc + (collect.emission as number),
      0
    );

    return {
      month,
      totalMass,
      totalLandfillCosts,
      totalFuel,
      totalEmissions
    };
  });

  return anualData;
};

export const getSemester = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  let startMonthIndex;

  if (currentMonth >= 0 && currentMonth <= 5) {
    startMonthIndex = 0; // Janeiro
  } else {
    startMonthIndex = 6;
  }

  const currentSemesterMonths = monthsArray.slice(
    startMonthIndex,
    startMonthIndex + 6
  );

  return currentSemesterMonths;
};

export function formatFloatToMMSS(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);

  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${paddedMinutes}h${paddedSeconds}`;
}
