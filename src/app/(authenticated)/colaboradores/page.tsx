"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { wrapper } from "@/common/constants/wrapper";
import LoadingComponent from "@atoms/Loading/loading";
import Title from "@atoms/Title/title";
import Input from "@atoms/Input/input";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";
import usePaginatedCollaborators from "@/hooks/queries/usePaginatedCollaborators";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

import InfoCard from "../veiculos-colaboradores/components/InfoCard/infoCard";

const Colaboradores = () => {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const {
    data: collaboratorsPage,
    isLoading,
    isFetching
  } = usePaginatedCollaborators(cityId, page, 10, { name });
  const collaborators = collaboratorsPage?.content ?? [];

  useEffect(() => {
    setPage(0);
  }, [name, cityId]);

  return (
    <div style={wrapper} className="py-14">
      <Title
        className="mb-14 flex cursor-pointer items-center gap-2 hover:underline"
        onClick={() => router.push("/veiculos-colaboradores")}
      >
        <Image
          src="/icon-left-arrow.svg"
          height={20}
          width={13}
          alt="Seta para esquerda"
          className="cursor-pointer"
        />
        Todos os colaboradores
      </Title>

      <div className="mb-10">
        <Input
          name="collaboratorName"
          placeholder="Buscar por nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="flex w-full flex-col gap-10">
          {collaborators.map((collaborator) => (
            <InfoCard
              key={collaborator.id}
              id={collaborator.id}
              title={collaborator.name}
              type="collaborator"
              values={[
                {
                  label: "Documento de identificacao",
                  content: collaborator.cpf || "Nao encontrado"
                }
              ]}
            />
          ))}
          {collaborators.length === 0 && (
            <p className="text-center text-sm text-greenDark-800">
              Nenhum colaborador encontrado.
            </p>
          )}
          <PaginationControls
            page={page}
            totalPages={collaboratorsPage?.totalPages}
            isLoading={isFetching}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default Colaboradores;
