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
    <div className="flex flex-col gap-4 rounded-lg border border-greenBlue-400 bg-[#FFFEFF] p-4">
      <Title className="text-[24px] font-semibold leading-6">{routeName}</Title>
      <div className="grid w-full grid-cols-2">
        <p className="font-medium text-greenDark-1000">Funcionamento</p>
        <p className="text-xs text-greenDark-1000">{periodName}</p>
      </div>
      <div className="grid w-full grid-cols-2">
        <p className="font-medium text-greenDark-1000">Dias</p>
        <p className="text-xs text-greenDark-1000">{routeDays}</p>
      </div>
      <div className="grid w-full grid-cols-2">
        <p className="font-medium text-greenDark-1000">Tipo de residuo</p>
        <p className="text-xs text-greenDark-1000">{residueType}</p>
      </div>
    </div>
  );
};

export default RouteInfoCard;
