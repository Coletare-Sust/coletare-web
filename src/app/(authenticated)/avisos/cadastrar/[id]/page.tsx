"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getWarningService,
  updateWarningService
} from "@/store/services/warning";
import { successToast, errorToast } from "@/hooks/useAppToast";
import WarningForm from "@/components/organisms/WarningForm/WarningForm";

type WarningFormValues = {
  title: string;
  description: string;
  image: File | string | null;
};

export default function EditWarningPage() {
  const { id } = useParams();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<WarningFormValues | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const warning = await getWarningService(id as string);
        if (!warning) {
          errorToast("Aviso não encontrado.");
          router.push("/avisos");
          return;
        }
        setInitialValues({
          title: warning.title,
          description: warning.description,
          image: warning.image
        });
      } catch {
        errorToast("Erro ao carregar aviso.");
      }
    };
    fetchData();
  }, [id, router]);

  const handleUpdate = async (data: WarningFormValues) => {
    const { title, description, image } = data;

    setLoading(true);
    try {
      await updateWarningService(id as string, {
        title,
        description,
        // Backend aceita apenas string (URL) para image, não File
        image: typeof image === "string" ? image : null,
      });
      successToast("Aviso atualizado!");
      router.push("/avisos");
    } catch {
      errorToast("Erro ao atualizar aviso");
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues) return null;

  return (
    <WarningForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      loading={loading}
      buttonLabel="Salvar Alterações"
      titlePage="Editar Aviso"
    />
  );
}
