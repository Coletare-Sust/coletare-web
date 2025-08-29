import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from "firebase/storage";
const storage = getStorage();

export const uploadImage = async (file: File, path = "images/") => {
  try {
    const storageRef = ref(storage, path + file.name);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return { image: downloadURL, error: null };
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return { image: null, error };
  }
};

export const deleteImage = (url: string | null | undefined) => {
  if (!url)
    return {
      error: "Não foi possível deletar a imagem"
    };

  const fileRef = ref(storage, url);
  return deleteObject(fileRef)
    .then(() => ({
      error: null
    }))
    .catch(() => ({
      error: "Não foi possível deletar a imagem"
    }));
};
