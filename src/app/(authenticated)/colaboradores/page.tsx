"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { wrapper } from "@/common/constants/wrapper";
import LoadingComponent from "@atoms/Loading/loading";
import Title from "@atoms/Title/title";
import useAllCollaborators from "@/hooks/queries/useAllCollaborators";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

import InfoCard from "../veiculos-colaboradores/components/InfoCard/infoCard";

const Colaboradores = () => {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;
  const { data: collaborators, isLoading } = useAllCollaborators(cityId);

  return (
    <div style={wrapper} className="py-14">
      <Title
        className="mb-14 flex cursor-pointer items-center gap-2 hover:underline"
        onClick={() => router.back()}
      >
        <Image
          src="/icon-left-arrow.svg"
          height={20}
          width={13}
          alt="Seta para esquerda"
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        Todos os colaboradores
      </Title>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="flex w-full flex-col gap-10">
          {collaborators?.map((collaborator) => {
            return (
              <InfoCard
                key={collaborator.id}
                id={collaborator.id}
                title={collaborator.name}
                type="collaborator"
                values={[
                  {
                    label: "Documento de identificação",
                    content: collaborator.cpf || "Não encontrado"
                  }
                ]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Colaboradores;
