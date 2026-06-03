"use client";

import { WarningEntity } from "@/common/entities/Warning";
import Button from "@/components/atoms/Button/button";
import Title from "@/components/atoms/Title/title";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import {
  getAllWarningService,
  deleteWarningService
} from "@/store/services/warning";
// TODO: substituir por MinIO quando upload de imagens for migrado
const deleteImage = async (_url?: string | null) => ({ error: null });
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/confirmationModal";
import { errorToast, successToast } from "@/hooks/useAppToast";
import DatePicker from "@/components/molecules/DatePicker/datePicker";
import { isSameDay } from "date-fns";

export default function ListaDeAvisosPag() {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [warnings, setWarnings] = useState<WarningEntity[] | null>(null);
  const [, setIsLoading] = useState(true);

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

  const filteredWarnings = useMemo(() => {
    if (!warnings) return [];
    if (!selectedDate) return warnings;
    return warnings.filter((warning) =>
      isSameDay(new Date(warning.createdAt), selectedDate)
    );
  }, [warnings, selectedDate]);

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

  const handleEdit = (warningId: string) => {
    router.push(`/avisos/cadastrar/${warningId}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start">
      <Title className="mt-12">Lista de Avisos</Title>
      <div className="mb-8 mt-4 flex w-full max-w-[1377px] flex-1 flex-col items-center justify-start gap-8 rounded-xl bg-slate-100 p-8 pt-0">
        <div className="border-white mt-8 flex w-full flex-row justify-start gap-4 border-b pb-4">
          <Button onClick={() => router.push("/avisos/cadastrar")}>
            Criar novo aviso
          </Button>
          <DatePicker date={selectedDate} setDate={setSelectedDate} />
        </div>
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWarnings && filteredWarnings.length > 0 ? (
            filteredWarnings
              .sort(
                (currentDate, nextDate) =>
                  new Date(nextDate.createdAt).getTime() -
                  new Date(currentDate.createdAt).getTime()
              )
              .map((e) => {
                return (
                  <div
                    className="flex h-[480px] w-full flex-col justify-between rounded-xl bg-white-900 p-6 shadow-md transition-shadow hover:shadow-lg"
                    key={e.id}
                  >
                    {e.image && (
                      <div className="relative my-4 h-40 w-full overflow-hidden rounded-md">
                        <Image
                          src={e.image}
                          layout="fill"
                          objectFit="cover"
                          alt={`Imagem de aviso sobre: ${e.title}`}
                        />
                      </div>
                    )}
                    <Title className="mb-2 truncate text-xl">{e.title}</Title>
                    <p className="line-clamp-5 text-justify">{e.description}</p>
                    <div className="relative mt-auto grid w-full grid-cols-2 items-center gap-4 border-t border-gray-200 pt-4">
                      <p className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white-900 px-2 text-sm text-gray-500">
                        {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                      </p>

                      <Button onClick={() => handleEdit(e.id)}>Editar</Button>
                      <Button
                        className="bg-red-500"
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
              })
          ) : (
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <p className="text-gray-500">
                Nenhum aviso para exibir no momento.
              </p>
            </div>
          )}
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
