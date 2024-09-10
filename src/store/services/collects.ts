import {
  ref,
  get,
  getDatabase,
  orderByChild,
  equalTo,
  query as queryDatabase,
  update
} from "firebase/database";

import { CollectEntity } from "@/common/entities/Collect";
import { diffInMonths } from "@/utils/diffInMonths";

export const getAllCollectsByRoute = async (routeId: string) => {
  const query = queryDatabase(
    ref(getDatabase(), `collects`),
    orderByChild("routeId"),
    equalTo(routeId)
  );

  return get(query)
    .then((snapshot) => {
      const collects = snapshot.val();
      const response = Object.keys(collects).map((key) => ({
        id: key,
        ...collects[key]
      }));
      return response ?? [];
    })
    .catch((error: any) => {
      console.error(error);
      return null;
    });
};

export const getAllCollectsByCity = async (cityId: string) => {
  const query = queryDatabase(
    ref(getDatabase(), `collects`),
    orderByChild("cityId"),
    equalTo(cityId)
  );

  return get(query)
    .then((snapshot) => {
      const collects = snapshot.val();
      const response = Object.keys(collects).map((key) => ({
        id: key,
        ...collects[key]
      }));
      return response ?? [];
    })
    .catch((error: any) => {
      console.error(error);
      return null;
    });
};

export const updateCollect = async (
  id: string,
  data: Partial<CollectEntity>
) => {
  try {
    const reposne = await update(ref(getDatabase(), `collects/${id}`), data);
    console.log(reposne);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getDashboardData = async (cityId: string, routeId?: string) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const monthDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const defaultDataValue: any = {
    landfill: {
      year: new Array(12).fill(0),
      semester: new Array(6).fill(0),
      month: new Array(monthDays).fill(0)
    },
    fuel: {
      year: new Array(12).fill(0),
      semester: new Array(6).fill(0),
      month: new Array(monthDays).fill(0)
    },
    emission: {
      year: new Array(12).fill(0),
      semester: new Array(6).fill(0),
      month: new Array(monthDays).fill(0)
    },
    mass: {
      year: new Array(12).fill(0),
      semester: new Array(6).fill(0),
      month: new Array(monthDays).fill(0)
    }
  };

  const finalData = defaultDataValue;

  // get requisition all data of the city in the last 12 months
  const queryRef = ref(getDatabase(), "collects");
  const query = queryDatabase(
    queryRef,
    orderByChild("cityId"),
    equalTo(cityId)
  );

  const response = await get(query)
    .then((snapshot) => {
      const collects = snapshot.val();
      let response: CollectEntity[] = Object.keys(collects)
        .map((key) => ({
          id: key,
          ...collects[key]
        }))
        .filter(
          (collect) =>
            diffInMonths(
              currentDate,
              new Date(collect.createdAt.seconds * 1000)
            ) <= 12
        );

      if (routeId) {
        response = response.filter((collect) => collect.routeId === routeId);
      }

      return response ?? [];
    })
    .catch((error: any) => {
      console.error(error);
      return null;
    });

  if (!response) return defaultDataValue;

  // order by month and year -> in this case year is in the january to december format
  response.forEach((collect: CollectEntity) => {
    const collectDate = new Date(collect.createdAt.seconds * 1000);
    const collectMonth = collectDate.getMonth();
    const collectDay = collectDate.getDate();

    const isFromThisMonth = collectDate.getMonth() === currentMonth;

    Object.keys(finalData).forEach((key) => {
      const finalLandfillValue =
        collect.mass && collect.cost?.landfillDelivery
          ? parseFloat(
              (collect.mass * collect.cost?.landfillDelivery).toFixed(2)
            )
          : 0;
      const finalCollectEmission =
        collect.consume && collect.kmRun && collect.emission
          ? parseFloat(
              (collect.consume * collect.kmRun * collect.emission).toFixed(2)
            )
          : 0;
      const finalCollectFuelCost =
        collect.cost?.fuel && collect.consume && collect.cost?.fuel
          ? parseFloat(
              (collect.consume * collect.kmRun * collect.cost?.fuel).toFixed(2)
            )
          : 0;

      const finalMass = collect.mass ? parseFloat(collect.mass.toFixed(2)) : 0;

      if (key === "landfill") {
        finalData[key].year[collectMonth] += finalLandfillValue;
        if (isFromThisMonth) {
          finalData[key].month[collectDay - 1] += finalLandfillValue;
        }
      }
      if (key === "fuel") {
        finalData[key].year[collectMonth] += finalCollectFuelCost;
        if (isFromThisMonth) {
          finalData[key].month[collectDay - 1] += finalCollectFuelCost;
        }
      }
      if (key === "emission") {
        finalData[key].year[collectMonth] += finalCollectEmission;
        if (isFromThisMonth) {
          finalData[key].month[collectDay - 1] += finalCollectEmission;
        }
      }
      if (key === "mass") {
        finalData[key].year[collectMonth] += finalMass;
        if (isFromThisMonth) {
          finalData[key].month[collectDay - 1] += finalMass;
        }
      }
    });
  });

  // order correctly the year + get semester (not jan to dec, but get the last 12 months)
  Object.keys(finalData).forEach((key) => {
    finalData[key].year = finalData[key].year
      .slice(currentMonth + 1)
      .concat(finalData[key].year.slice(0, currentMonth + 1));
    finalData[key].semester = finalData[key].year.slice(-6);
  });
  return finalData;
};
