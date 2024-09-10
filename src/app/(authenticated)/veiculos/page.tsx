"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { wrapper } from "@/common/constants/wrapper";
import Title from "@atoms/Title/title";
import LoadingComponent from "@atoms/Loading/loading";
import useAllVehicles from "@/hooks/queries/useAllVehicles";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

import InfoCard from "../veiculos-colaboradores/components/InfoCard/infoCard";

const Veiculos = () => {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;
  const { data: vehicles, isLoading } = useAllVehicles(cityId);

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
        Todos os veículos
      </Title>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="flex w-full flex-col gap-10">
          {vehicles?.map((vehicle) => {
            return (
              <InfoCard
                key={vehicle.id}
                id={vehicle.id}
                type="vehicle"
                title={vehicle.name}
                values={[
                  {
                    label: "Login",
                    content: vehicle.email || "Não encontrado"
                  },
                  { label: "Senha", content: "*********" },
                  {
                    label: "Placa",
                    content: vehicle.carPlate || "Não encontrado"
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

export default Veiculos;
