import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import { residuesTypesEn } from "@common/constants/residuesTypes";
import useOneUser from "@hooks/queries/useOneUser";

import { Extended } from "../types";

const InfoRow = ({ data }: { data: Extended }) => {
  const labelStyles = " font-medium ";
  const boxStyles = `h-[80px] pl-[20px] border border-greenBlue-400 space-x-8 flex items-center `;

  const { data: requesterData } = useOneUser(data.createdById);

  return (
    <div
      className={`grid grid-cols-10 items-center transition-all ${
        !data.isResolved && "cursor-pointer hover:scale-[101%]"
      }`}
      onClick={() => !data.isResolved && data.onClick()}
    >
      <p className=" col-span-1 p-4  pr-10">
        {!data.isResolved ? "Aberto" : "Fechado"}
      </p>

      <div
        className={
          boxStyles +
          " col-span-3 rounded-l-md " +
          `${!data.isResolved ? "bg-greenAqua-200" : "bg-white-800"}`
        }
      >
        <span className={labelStyles}>Local</span>
        <span className="truncate">{data.fullAddress}</span>
      </div>
      <div
        className={
          boxStyles +
          `col-span-2 ${!data.isResolved ? "bg-greenAqua-200" : "bg-white-800"}`
        }
      >
        <span className={labelStyles}>Solicitante</span>
        <span className="truncate">{requesterData?.name}</span>
      </div>
      <div
        className={
          boxStyles +
          `col-span-2 ${!data.isResolved ? "bg-greenAqua-200" : "bg-white-800"}`
        }
      >
        <span className={labelStyles}>Data</span>
        {
          <span>
            {data.createdAt
              ? format(new Date(data.createdAt), "dd/MM/yyyy", { locale: ptBR })
              : "—"}
          </span>
        }
      </div>
      <div
        className={
          boxStyles +
          " col-span-2 rounded-r-md " +
          `${!data.isResolved ? "bg-greenAqua-200" : "bg-white-800"}`
        }
      >
        <span className={labelStyles}>
          Tipo de <br />
          Residuo
        </span>
        <span>{data.residueType}</span>
      </div>
    </div>
  );
};

export default InfoRow;
