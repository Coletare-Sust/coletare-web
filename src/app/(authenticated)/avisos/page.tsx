"use client";

import { WarningEntity } from "@/common/entities/Warning";
import Button from "@/components/atoms/Button/button";
import Title from "@/components/atoms/Title/title";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import { deleteImage } from "@/store/services/firebaseStorage";
import {
  getWarningsPageService,
  deleteWarningService
} from "@/store/services/warning";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/confirmationModal";
import { errorToast, successToast } from "@/hooks/useAppToast";
import DatePicker from "@/components/molecules/DatePicker/datePicker";
import { endOfDay, startOfDay } from "date-fns";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";

export default function ListaDeAvisosPag() {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined
  );
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const [warnings, setWarnings] = useState<WarningEntity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [clickedWarning, setClickedWarning] = useState<
    WarningEntity | undefined
  >(undefined);

  const router = useRouter();
  const dateFilters = useMemo(() => {
    if (!startDateFilter) {
      return {
        startDate: undefined,
        endDate: undefined
      };
    }

    return {
      startDate: startOfDay(startDateFilter).toISOString(),
      endDate: endOfDay(endDateFilter ?? startDateFilter).toISOString()
    };
  }, [endDateFilter, startDateFilter]);

  useEffect(() => {
    const fetchWarning = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const fetchedWarnings = await getWarningsPageService(
          user.id,
          page,
          pageSize,
          {
            search,
            startDate: dateFilters.startDate,
            endDate: dateFilters.endDate
          }
        );
        setWarnings(fetchedWarnings.content);
        setTotalPages(fetchedWarnings.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarning();
  }, [dateFilters.endDate, dateFilters.startDate, page, search, user]);

  useEffect(() => {
    setPage(0);
  }, [dateFilters.endDate, dateFilters.startDate, search, user?.id]);

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
          <DatePicker
            date={startDateFilter}
            setDate={setStartDateFilter}
            endDate={endDateFilter}
            setEndDate={setEndDateFilter}
            mode="range"
            label="Periodo"
          />
          <input
            className="min-w-[280px] rounded-lg border border-greenBlue-400 bg-white-1000 px-4 py-3 outline-none focus:border-greenBlue-1000"
            placeholder="Buscar aviso"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {isLoading && <p className="text-sm text-gray-500">Carregando...</p>}
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {warnings && warnings.length > 0 ? (
            warnings
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
        <PaginationControls
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
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
