import { getFuelTypeLabel } from "@/common/mappers/backendEnums";
import type { BiomassOutput } from "@/store/services/biomass";

const BiomassSummary = ({ biomass }: { biomass: BiomassOutput }) => (
  <dl className="grid grid-cols-2 gap-4 text-greenDark-800">
    <div>
      <dt className="font-semibold">Composição</dt>
      <dd>
        {biomass.items
          .map(
            (item) =>
              `${item.materialDescription}: ${item.massKg.toLocaleString(
                "pt-BR"
              )} kg`
          )
          .join(" · ")}
        <br />
        <strong>Total: {biomass.totalKg.toLocaleString("pt-BR")} kg</strong>
      </dd>
    </div>
    <div>
      <dt className="font-semibold">Origem</dt>
      <dd>{biomass.origin.fullAddress}</dd>
    </div>
    <div>
      <dt className="font-semibold">Destino</dt>
      <dd>
        {biomass.destination.name} ({biomass.destination.typeDescription})
      </dd>
    </div>
    <div>
      <dt className="font-semibold">Horários</dt>
      <dd>
        Coleta: {new Date(biomass.collectedAt).toLocaleString("pt-BR")}
        <br />
        Entrega: {new Date(biomass.deliveredAt).toLocaleString("pt-BR")}
      </dd>
    </div>
    {biomass.fuel && (
      <div>
        <dt className="font-semibold">Combustível</dt>
        <dd>
          {getFuelTypeLabel(biomass.fuel.type)} ·{" "}
          {biomass.fuel.liters.toLocaleString("pt-BR")} L (
          {biomass.fuel.source === "MEASURED" ? "medido" : "estimado"})
        </dd>
      </div>
    )}
  </dl>
);

export default BiomassSummary;
