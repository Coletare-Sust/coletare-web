import {
  get,
  getDatabase,
  orderByChild,
  ref,
  set,
  equalTo,
  query as queryDatabase,
  remove,
  update
} from "firebase/database";

import firebaseApp from "@/config/firebase";
import { RouteEntity } from "@/common/entities/route";

const database = getDatabase(firebaseApp);

export const createRoute = async (data: RouteEntity) => {
  try {
    console.log({ data });
    set(ref(database, "routes/" + data.id), data);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getRoutes = async (cityId: string) => {
  const query = queryDatabase(
    ref(getDatabase(), `routes`),
    orderByChild("cityId"),
    equalTo(cityId)
  );
  return get(query)
    .then((snapshot) => {
      const routesObj = snapshot.val();
      if (!routesObj || routesObj.length === 0) return [];
      const response = Object.keys(routesObj).map((key) => routesObj[key]);
      return response ?? [];
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
};

export const deleteRoute = async (routeId: string) => {
  try {
    const routeRef = ref(database, `routes/${routeId}`);
    await remove(routeRef);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getRoute = async (routeId: string) => {
  try {
    const routeRef = ref(database, `routes/${routeId}`);
    const snapshot = await get(routeRef);

    if (snapshot.exists()) {
      return { id: routeId, ...snapshot.val() };
    } else {
      return { error: "Route not found" };
    }
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateRouteDoc = async (
  uid: string,
  data: Partial<RouteEntity>
) => {
  try {
    const userRef = ref(database, `routes/${uid}`);
    await update(userRef, data);
    return { error: null };
  } catch (error: any) {
    console.log(error);
    return { error: error.message };
  }
};
