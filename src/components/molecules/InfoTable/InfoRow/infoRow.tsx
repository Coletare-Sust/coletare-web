import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import useOneUser from "@hooks/queries/useOneUser";
import { Badge } from "@/components/ui/badge";

import { Extended } from "../types";

const InfoRow = ({ data }: { data: Extended }) => {
  const labelStyles = " font-medium ";
  const boxStyles = `h-[80px] pl-[20px] border border-greenBlue-400 space-x-8 flex items-center `;

  const { data: requesterData } = useOneUser(data.createdById);

  const isOpen = !data.isResolved;
  const dateLabel = data.createdAt
    ? format(new Date(data.createdAt), "dd/MM/yyyy", { locale: ptBR })
    : "—";

  const handleClick = () => {
    if (isOpen) data.onClick();
  };

  return (
    <>
      {/* Celular e tablet: cartão empilhado */}
      <div
        role={isOpen ? "button" : undefined}
        tabIndex={isOpen ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (isOpen && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            data.onClick();
          }
        }}
        className={`flex flex-col gap-3 rounded-xl border border-greenBlue-400 p-4 lg:hidden ${
          isOpen
            ? "cursor-pointer bg-greenAqua-200 active:bg-greenAqua-400"
            : "bg-white-800"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <Badge variant={isOpen ? "warning" : "neutral"}>
            {isOpen ? "Aberto" : "Fechado"}
          </Badge>
          <span className="text-sm text-greenDark-800">{dateLabel}</span>
        </div>
        <p className="line-clamp-2 font-medium text-greenBlue-1000">
          {data.fullAddress}
        </p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-greenDark-600">Solicitante</dt>
            <dd className="truncate text-greenDark-1000">
              {requesterData?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-greenDark-600">Tipo de resíduo</dt>
            <dd className="text-greenDark-1000">{data.residueType}</dd>
          </div>
        </dl>
      </div>

      {/* Desktop: linha em grade */}
      <div
        className={`hidden grid-cols-10 items-center transition-all lg:grid ${
          isOpen && "cursor-pointer hover:scale-[101%]"
        }`}
        onClick={handleClick}
      >
        <div className="col-span-1 p-4 pr-10">
          <Badge variant={isOpen ? "warning" : "neutral"}>
            {isOpen ? "Aberto" : "Fechado"}
          </Badge>
        </div>

        <div
          className={
            boxStyles +
            " col-span-3 rounded-l-md " +
            `${isOpen ? "bg-greenAqua-200" : "bg-white-800"}`
          }
        >
          <span className={labelStyles}>Local</span>
          <span className="truncate">{data.fullAddress}</span>
        </div>
        <div
          className={
            boxStyles +
            `col-span-2 ${isOpen ? "bg-greenAqua-200" : "bg-white-800"}`
          }
        >
          <span className={labelStyles}>Solicitante</span>
          <span className="truncate">{requesterData?.name}</span>
        </div>
        <div
          className={
            boxStyles +
            `col-span-2 ${isOpen ? "bg-greenAqua-200" : "bg-white-800"}`
          }
        >
          <span className={labelStyles}>Data</span>
          <span>{dateLabel}</span>
        </div>
        <div
          className={
            boxStyles +
            " col-span-2 rounded-r-md " +
            `${isOpen ? "bg-greenAqua-200" : "bg-white-800"}`
          }
        >
          <span className={labelStyles}>
            Tipo de <br />
            Resíduo
          </span>
          <span>{data.residueType}</span>
        </div>
      </div>
    </>
  );
};

export default InfoRow;
