// Firebase Storage desativado no frontend (migrado para o backend)
export const uploadImage = async (file: File, path = "images/") => {
  try {
    // uploadBytes desativado
    const downloadURL = "";
    return { image: downloadURL, error: null };
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return { image: null, error };
  }
};

export const deleteImage = async (url: string | null | undefined) => {
  if (!url)
    return {
      error: "Não foi possível deletar a imagem"
    };

  return { error: null };
};
