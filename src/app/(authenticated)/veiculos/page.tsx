"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { wrapper } from "@/common/constants/wrapper";
import Title from "@atoms/Title/title";
import LoadingComponent from "@atoms/Loading/loading";
import Input from "@atoms/Input/input";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";
import usePaginatedVehicles from "@/hooks/queries/usePaginatedVehicles";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

import InfoCard from "../veiculos-colaboradores/components/InfoCard/infoCard";

const Veiculos = () => {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const {
    data: vehiclesPage,
    isLoading,
    isFetching,
  } = usePaginatedVehicles(cityId, page, 10, { name, carPlate });
  const vehicles = vehiclesPage?.content ?? [];

  useEffect(() => {
    setPage(0);
  }, [name, carPlate, cityId]);

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
        Todos os veiculos
      </Title>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <Input
          name="vehicleName"
          placeholder="Buscar por nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          name="vehiclePlate"
          placeholder="Buscar por placa"
          value={carPlate}
          onChange={(event) => setCarPlate(event.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="flex w-full flex-col gap-10">
          {vehicles.map((vehicle) => (
            <InfoCard
              key={vehicle.id}
              id={vehicle.id}
              type="vehicle"
              title={vehicle.name}
              values={[
                { label: "Login", content: vehicle.email || "Nao encontrado" },
                { label: "Senha", content: "*********" },
                {
                  label: "Placa",
                  content: vehicle.carPlate || "Nao encontrado",
                },
              ]}
            />
          ))}
          {vehicles.length === 0 && (
            <p className="text-center text-sm text-greenDark-800">
              Nenhum veiculo encontrado.
            </p>
          )}
          <PaginationControls
            page={page}
            totalPages={vehiclesPage?.totalPages}
            isLoading={isFetching}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default Veiculos;
