import Image from "next/image";
import { useRouter } from "next/navigation";

import Title from "@atoms/Title/title";
import BackgroundWrapper from "@atoms/BackgroudWrapper/backgroundWrapper";
import { wrapper } from "@/common/constants/wrapper";

import { RegisterVehiclesCollaboratorsProps } from "./types";

const RegisterVehiclesCollaborators = ({
  children,
  type,
  className,
  isEdit
}: RegisterVehiclesCollaboratorsProps) => {
  const image = type === "vehicle" ? "/vehicle.png" : "/collaborator.png";
  const router = useRouter();
  return (
    <div style={wrapper} className="py-14">
      <Title className="mb-14 flex cursor-pointer items-center gap-2 hover:underline">
        <Image
          src="/icon-left-arrow.svg"
          height={20}
          width={13}
          alt="Seta para esquerda"
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        {isEdit ? "Editar" : "Cadastrar novo"}{" "}
        {type === "vehicle" ? "Veículo" : "Colaborador"}
      </Title>

      <BackgroundWrapper className="flex w-full flex-col">
        <div className={className}>{children}</div>
      </BackgroundWrapper>
    </div>
  );
};

export default RegisterVehiclesCollaborators;
