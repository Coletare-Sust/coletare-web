"use client";

import { useRouter } from "next/navigation";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import LoadingComponent from "@atoms/Loading/loading";
import { wrapper } from "@/common/constants/wrapper";
import useAllVehicles from "@/hooks/queries/useAllVehicles";
import useAllCollaborators from "@/hooks/queries/useAllCollaborators";

import InfoCard from "./components/InfoCard/infoCard";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

const VeiculosColaboradoresPage = () => {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;
  const { data: collaborators, isLoading: isLoadingCollaborators } =
    useAllCollaborators(cityId);
  const { data: vehicles, isLoading: isLoadingVehicles } =
    useAllVehicles(cityId);
  const router = useRouter();

  const slicedVehicles = vehicles?.slice(0, 5);
  const slicedCollaborators = collaborators?.slice(0, 5);

  if (isLoadingVehicles || isLoadingCollaborators) {
    return (
      <div className="absolute flex h-[50%] w-full items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Title>Veículos</Title>
        <div className="flex flex-wrap gap-3 sm:gap-6">
          <Button
            onClick={() => router.push("/rotas-andamento")}
            className="border-greenBlue-1000 bg-transparent text-greenBlue-1000"
          >
            Visualizar rotas
          </Button>
          <Button onClick={() => router.push("/cadastrar-veiculo")}>
            Cadastrar novo
          </Button>
        </div>
      </div>
      {slicedVehicles?.length === 0 && (
        <p className="text-lg font-medium text-greenDark-1000">
          Nenhum veículo cadastrado
        </p>
      )}
      <div className="flex w-full flex-col gap-10">
        {slicedVehicles?.map((vehicle) => {
          return (
            <InfoCard
              key={vehicle.id}
              id={vehicle.id}
              type="vehicle"
              title={vehicle.name}
              values={[
                { label: "Login", content: vehicle.email || "Não encontrado" },
                { label: "Senha", content: "*********" },
                {
                  label: "Placa",
                  content: vehicle.carPlate || "Não encontrado"
                }
              ]}
            />
          );
        })}
        {slicedVehicles?.length !== 0 && (
          <p
            className="cursor-pointer text-center font-light italic text-greenBlue-1000 underline transition-all hover:text-greenBlue-600"
            onClick={() => router.push("/veiculos")}
          >
            Ver todos os veículos
          </p>
        )}
      </div>

      <div className="my-20 h-[1px] w-full bg-greenBlue-400"></div>

      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Title>Colaboradores</Title>
        <Button onClick={() => router.push("/cadastrar-colaborador")}>
          Cadastrar novo
        </Button>
      </div>
      {slicedCollaborators?.length === 0 && (
        <p className="text-lg font-medium text-greenDark-1000">
          Nenhum colaborador cadastrado
        </p>
      )}
      <div className="flex w-full flex-col gap-10">
        {slicedCollaborators?.map((collaborator) => {
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
        {slicedCollaborators?.length !== 0 && (
          <p
            className="cursor-pointer text-center font-light italic text-greenBlue-1000 underline transition-all hover:text-greenBlue-800"
            onClick={() => router.push("/colaboradores")}
          >
            Ver todos os colaboradores
          </p>
        )}
      </div>
    </div>
  );
};

export default VeiculosColaboradoresPage;
