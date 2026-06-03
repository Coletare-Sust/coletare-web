import {
  ref,
  orderByChild,
  equalTo,
  getDatabase,
  query as queryDatabase,
  get
} from "firebase/database";
import firebaseConfig from "@/config/firebase";

export const getAllWithdrawalsRequests = async (cityId: string) => {
  const query = queryDatabase(
    ref(getDatabase(firebaseConfig), `withdrawalsRequests`),
    orderByChild("cityId"),
    equalTo(cityId)
  );
  return get(query)
    .then((snapshot) => {
      const wdObj = snapshot.val();
      if (!wdObj) return [];
      const response = Object.keys(wdObj).map((key) => ({
        id: key,
        ...wdObj[key]
      }));
      return response;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
};
