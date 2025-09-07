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

export default function ListaDeAvisosPag() {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const [warnings, setWarnings] = useState<WarningEntity[] | null>(null);
  const [, setIsLoading] = useState(true);

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

  //
  const handleDelete = async (warning: WarningEntity) => {
    if (!confirm("Tem certeza que deseja remover este aviso?")) return;

    try {
      if (warning.image) {
        const { error } = await deleteImage(warning.image);
        if (error) console.warn("Erro ao excluir imagem:", error);
      }

      const { error } = await deleteWarningService(warning.id);
      if (error) throw new Error(error);

      setWarnings((prev) => prev?.filter((w) => w.id !== warning.id) ?? null);
    } catch (err) {
      console.error("Erro ao remover aviso:", err);
      alert("Não foi possível remover o aviso.");
    }
  };
  //
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
          {warnings.map((e) => {
            return (
              <div
                className="flex w-full max-w-sm flex-col items-center justify-center rounded-xl bg-white-900 p-6 shadow-sm shadow-black/20"
                key={e.id}
              >
                <Title>{e.title}</Title>
                <p>{e.description}</p>
                {e.image && (
                  <Image
                    src={e.image}
                    width={255}
                    height={255}
                    alt={`Imagem de aviso sobre: ${e.title}`}
                    className="mb-4 mt-4"
                  />
                )}
                <div className="flex w-4/5 flex-row items-center justify-center gap-4">
                  <Button className="w-1/2">Editar</Button>
                  {/* <Button className="w-1/2 bg-red-500">Remover</Button> */}
                  <Button
                    className="w-1/2 bg-red-500"
                    onClick={() => handleDelete(e)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
