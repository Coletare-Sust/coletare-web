import firebaseApp from "@/config/firebase";
import { UserEntity } from "@common/entities/user";
import { User, getAuth } from "firebase/auth";
import {
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
import { uploadImage } from "./firebaseStorage";

const auth = getAuth(firebaseApp);

const database = getDatabase(firebaseApp);

export const createUserDoc = async (data: UserEntity) => {
  try {
    set(ref(database, "users/" + data.id), data);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { errorDoc: error.message };
  }
};

export const waitForUser = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

export const getUsers = async () => {
  try {
    const routesRef = ref(database, "users");
    const snapshot = await get(routesRef);

    if (snapshot.exists()) {
      const routesObj = snapshot.val();
      const routesArray = Object.keys(routesObj).map((key) => ({
        uid: key,
        ...routesObj[key]
      }));
      return routesArray;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(error);
  }
};

export const createUser = async (data: UserEntity, image: File) => {
  try {
    if (image) {
      const { image: imageUrl, error } = await uploadImage(image);
      if (error || !imageUrl)
        throw new Error("Não foi possível fazer upload de imagem");
      set(ref(database, "users/" + data.id), { ...data, imageUrl });
    } else {
      set(ref(database, "users/" + data.id), data);
    }
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getUser = async (uid: string | null) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return { ...snapshot.val(), uid };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const getAllVehicles = async (cityId: string) => {
  try {
    const query = queryDatabase(
      ref(database, `users`),
      orderByChild("cityId"),
      equalTo(cityId)
    );
    const snapshot = await get(query);

    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      const usersArray = Object.keys(usersObj)
        .map((key) => ({
          id: key,
          ...usersObj[key]
        }))
        .filter((user) => user.role === "vehicle");
      return usersArray;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const deleteUser = async (id: string) => {
  try {
    await remove(ref(database, `users/${id}`));

    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const getAllCollaborators = async (cityId: string) => {
  try {
    const query = queryDatabase(
      ref(database, `users`),
      orderByChild("cityId"),
      equalTo(cityId)
    );
    const snapshot = await get(query);

    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      const routesArray = Object.keys(usersObj)
        .map((key) => ({
          id: key,
          ...usersObj[key]
        }))
        .filter((user) => user.role === "employee");
      return routesArray;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateUserDoc = async (uid: string, data: Partial<UserEntity>) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, data);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateUser = async (id: string, data: Partial<UserEntity>) => {
  try {
    await update(ref(database, `users/${id}`), data);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
};

export const deleteUserDoc = async (uid: string) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    await remove(userRef);
    return { error: null };
  } catch (error: any) {
    console.error(error);
    return { errorDoc: error.message };
  }
};

export const getAllCities = async () => {
  const query = queryDatabase(
    ref(getDatabase(), `users`),
    orderByChild("role"),
    equalTo("admin")
  );
  // image not null -> https://hackmd.io/@19NEpHF2TqGisirWoYuagA/BJvF6snvf?type=view
  return get(query)
    .then((snapshot) => {
      const usersObj = snapshot.val();
      const response = Object.keys(usersObj).map((key) => usersObj[key]);
      return response ?? [];
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
};

export const getAllCitizens = async (cityId: string) => {
  const query = queryDatabase(
    ref(getDatabase(), `users`),
    orderByChild("cityId"),
    equalTo(cityId)
  );
  // image not null -> https://hackmd.io/@19NEpHF2TqGisirWoYuagA/BJvF6snvf?type=view
  return get(query)
    .then((snapshot) => {
      const usersObj = snapshot.val();
      const response = Object.keys(usersObj).map((key) => ({
        ...usersObj[key],
        id: key
      }));
      return (response ?? []).filter(
        (item) => item.role === "citizen"
      ) as UserEntity[];
    })
    .catch((error) => {
      console.error(error);
      return [];
    });
};
