import Title from "@atoms/Title/title";

import { RouteInfoCardProps } from "./types";

const RouteInfoCard = ({
  period,
  residueType,
  routeName,
  routeDays
}: RouteInfoCardProps) => {
  let periodName = "";

  switch (period) {
    case "morning":
      periodName = "Turno da manha";
      break;
    case "afternoon":
      periodName = "Turno da tarde";
      break;
    case "night":
      periodName = "Turno da noite";
      break;
    default:
      periodName = "Sem turno definido";
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-greenBlue-400 bg-white-900 p-4">
      <Title className="text-xl font-semibold leading-snug sm:text-[24px]">
        {routeName}
      </Title>
      <div className="grid w-full grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-2">
        <p className="font-medium text-greenDark-1000">Funcionamento</p>
        <p className="break-words text-sm text-greenDark-1000 sm:text-xs">
          {periodName}
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-2">
        <p className="font-medium text-greenDark-1000">Dias</p>
        <p className="break-words text-sm text-greenDark-1000 sm:text-xs">
          {routeDays}
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-2">
        <p className="font-medium text-greenDark-1000">Tipo de residuo</p>
        <p className="break-words text-sm text-greenDark-1000 sm:text-xs">
          {residueType}
        </p>
      </div>
    </div>
  );
};

export default RouteInfoCard;
