"use client";

/* eslint-disable react/jsx-key */
import { wrapper } from "@/common/constants/wrapper";
import { WarningEntity } from "@/common/entities/Warning";
import Button from "@/components/atoms/Button/button";
import Title from "@/components/atoms/Title/title";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import { deleteImage } from "@/store/services/firebaseStorage";
import {
  getAllWarningService,
  deleteWarningService
} from "@/store/services/warning";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/confirmationModal";
import { errorToast, successToast } from "@/hooks/useAppToast";

export default function ListaDeAvisosPag() {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const [warnings, setWarnings] = useState<WarningEntity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [clickedWarning, setClickedWarning] = useState<
    WarningEntity | undefined
  >(undefined);

  const router = useRouter();

  useEffect(() => {
    const fetchWarning = async () => {
      if (!user) return;
      try {
        const fetchedWarnings = await getAllWarningService(user.id);
        setWarnings(fetchedWarnings);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarning();
  }, [user]);

  const handleDelete = async () => {
    if (!clickedWarning) return;

    setOpenDeleteModal(false);

    try {
      if (clickedWarning.image) {
        await deleteImage(clickedWarning.image);
      }

      const { error } = await deleteWarningService(clickedWarning.id);
      if (error) throw new Error(error);

      setWarnings(
        (prev) => prev?.filter((w) => w.id !== clickedWarning.id) ?? null
      );
      successToast("Aviso removido com sucesso!");
    } catch (err) {
      console.error("Erro ao remover aviso:", err);
      errorToast("Não foi possível remover o aviso.");
    } finally {
      setClickedWarning(undefined);
    }
  };

  if (isLoading) {
    return (
      <div style={wrapper}>
        <Title>Carregando avisos...</Title>
      </div>
    );
  }

  if (!warnings || warnings.length === 0)
    return (
      <div
        style={wrapper}
        className="flex min-h-screen items-center justify-center"
      >
        <Title>Nenhum aviso encontrado.</Title>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Title className="ml-12 mt-8 self-start">Lista de Avisos</Title>
      <div className="mb-8 mt-4 flex w-full max-w-[1377px] flex-1 flex-col content-start items-start justify-center gap-8 rounded-xl bg-slate-100 p-8 pt-0">
        <div className="mt-8">
          <Button onClick={() => router.push("/avisos/cadastrar")}>
            Criar novo aviso
          </Button>
        </div>
        <div className="flex h-full w-full flex-row flex-wrap gap-8">
          {warnings
            .sort(
              (currentDate, nextDate) =>
                new Date(nextDate.createdAt).getTime() -
                new Date(currentDate.createdAt).getTime()
            )
            .map((e) => {
              return (
                <div
                  className="flex w-full max-w-sm flex-col items-center justify-center rounded-xl bg-white-900 p-6 shadow-sm shadow-black/20"
                  key={e.id}
                >
                  <Title>{e.title}</Title>
                  {e.image && (
                    <Image
                      src={e.image}
                      width={255}
                      height={255}
                      alt={`Imagem de aviso sobre: ${e.title}`}
                      className="mb-4 mt-4"
                    />
                  )}
                  <p className="max-w-[255px] text-justify">{e.description}</p>
                  <div className="mt-4 flex w-4/5 flex-row items-center justify-center gap-4">
                    <Button className="w-1/2">Editar</Button>
                    <Button
                      className="w-1/2 bg-red-500"
                      onClick={() => {
                        setOpenDeleteModal(true);
                        setClickedWarning(e);
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <ConfirmationModal
        title="Excluir aviso"
        description="Tem certeza de que deseja excluir este aviso? A imagem associada também será removida e a ação não poderá ser desfeita."
        isOpen={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
}
