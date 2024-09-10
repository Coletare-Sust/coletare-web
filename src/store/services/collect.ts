import {
  startAt,
  get,
  getDatabase,
  orderByChild,
  query as queryDatabase,
  ref,
  set,
  remove,
  equalTo,
  update
} from "firebase/database";

import firebaseApp from "@/config/firebase";

const database = getDatabase(firebaseApp);

export const getCollect = async (collectId: string) => {
  try {
    const collectRef = ref(database, `collects/${collectId}`);
    const snapshot = await get(collectRef);

    if (snapshot.exists()) {
      return { id: collectId, ...snapshot.val() };
    } else {
      return { error: "Collect not found" };
    }
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getAllCollects = async () => {
  try {
    const query = queryDatabase(ref(database, `collects`));
    const snapshot = await get(query);

    if (snapshot.exists()) {
      const routesObj = snapshot.val();
      const routesArray = Object.keys(routesObj).map((key) => ({
        id: key,
        ...routesObj[key]
      }));
      return routesArray;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};
