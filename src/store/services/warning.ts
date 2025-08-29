import { WarningDTO } from "@/app/api/warnings/createWarning/route";
import { getUser } from "./user";
import { UserEntity } from "@/common/entities/user";
import { uploadImage } from "./firebaseStorage";
import { getDatabase, push, ref, set } from "firebase/database";
import { WarningEntity } from "@/common/entities/Warning";
import { Timestamp } from "firebase/firestore";
import app from "@/config/firebase";

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
    if (error || !imageUrl) throw new Error("Não foi possível subir a imagem!");
    imageUrl = image;
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
