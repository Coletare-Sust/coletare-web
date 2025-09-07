import { getUser } from "./user";
import { UserEntity } from "@/common/entities/user";
import { uploadImage } from "./firebaseStorage";
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  push,
  query as queryDatabase,
  ref,
  set,
  remove // ✅ adicionar remove
} from "firebase/database";
import { WarningEntity } from "@/common/entities/Warning";
import { Timestamp } from "firebase/firestore";
import app from "@/config/firebase";
import { error } from "console";
import { WarningDTO } from "@/common/dtos/WarningDTO";

const database = getDatabase(app);

export const createWarningService = async (warning: WarningDTO) => {
  const user: UserEntity = await getUser(warning.userId);

  if (user.role !== "admin") throw new Error("Usuário não autorizado!");

  const newWarningRef = push(ref(database, "warnings"));
  const warningId = newWarningRef.key;

  if (!warningId) throw new Error("Erro ao criar id com push");

  let imageUrl: string | null = null;
  if (warning.image) {
    const { image, error } = await uploadImage(
      warning.image,
      `warning/${warningId}`
    );
    imageUrl = image;
    if (error || !imageUrl)
      throw new Error(`Não foi possível subir a imagem!\n${error}`);
  }

  const warningToSave: WarningEntity = {
    id: warningId,
    userId: warning.userId,
    title: warning.title,
    description: warning.description,
    image: imageUrl,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  await set(newWarningRef, warningToSave);
  return warningToSave;
};

export const getAllWarningService = async (
  userId: string
): Promise<WarningEntity[]> => {
  const query = queryDatabase(
    ref(database, `warnings`),
    orderByChild("userId"),
    equalTo(userId)
  );

  return get(query)
    .then((snapshot) => {
      const warningsObj = snapshot.val();
      if (!warningsObj || warningsObj.length === 0) return [];
      const response = Object.keys(warningsObj).map((key) => warningsObj[key]);
      return response ?? [];
    })
    .catch((error) => {
      console.error(error);
      throw new Error(error);
    });
};

//
export const deleteWarningService = async (warningId: string) => {
  try {
    const warningRef = ref(database, `warnings/${warningId}`);
    await remove(warningRef);
    return { error: null };
  } catch (err) {
    console.error("Erro ao deletar aviso:", err);
    return { error: "Não foi possível deletar o aviso" };
  }
};
