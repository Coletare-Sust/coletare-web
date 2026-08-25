"use client";
import { useState } from "react";
import { createWarningService } from "@/store/services/warning";
import { successToast, errorToast } from "@/hooks/useAppToast";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { useRouter } from "next/navigation";
import WarningForm from "@/components/organisms/WarningForm/WarningForm";

export default function PostPage() {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data: {
    title: string;
    description: string;
    image: File | string | null;
  }) => {
    const { title, description, image } = data;

    if (!user) return;

    if (!title || !description || !image) {
      errorToast("Preencha todos os campos!");
      return;
    }

    if (!(image instanceof File)) {
      errorToast("Selecione uma imagem válida");
      return;
    }

    setLoading(true);
    try {
      await createWarningService(user.id, {
        title,
        description,
        image: image instanceof File ? image : null
      });
      successToast("Postagem criada!");
      router.push("/avisos");
    } catch {
      errorToast("Erro ao criar aviso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WarningForm
      onSubmit={handleCreate}
      loading={loading}
      buttonLabel="Realizar post"
      titlePage="Criar Novo Aviso"
    />
  );
}
