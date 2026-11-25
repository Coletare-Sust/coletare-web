"use client";

import Select from "@atoms/Select/select";
import React, { useEffect, useState } from "react";
import Subtitle from "@atoms/Subtitle/subtitle";
import Button from "@atoms/Button/button";
import BiomassSummary from "@/components/molecules/BiomassSummary/BiomassSummary";
import { errorToast, successToast } from "@/hooks/useAppToast";
import { hasPermission } from "@/common/accessControl/permissions";
import {
  BIOMASS_MATERIAL_LABELS,
  FUEL_TYPE_LABELS
} from "@/common/mappers/backendEnums";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useAllDisposalSites from "@/hooks/queries/disposalSite/useAllDisposalSites";
import useCollectBiomass from "@/hooks/queries/biomass/useCollectBiomass";
import useBiomassDraft from "@/hooks/queries/biomass/useBiomassDraft";
import {
  useRegisterBiomass,
  useRemoveBiomass
} from "@/hooks/queries/biomass/useBiomassMutations";
import type { BiomassMaterial, FuelType } from "@/store/services/biomass";

interface CollectBiomassSectionProps {
  collectId: string;
  cityId: string;
  hasEnded: boolean;
  /** Massa da coleta em toneladas, informada à parte (a biomassa só a detalha). */
  collectMassTons?: number;
}

const MATERIALS = Object.keys(BIOMASS_MATERIAL_LABELS) as BiomassMaterial[];

const inputClass =
  "h-10 w-full rounded-lg border border-greenBlue-800 bg-greenBebe-200 px-3 text-greenBlue-1000";

/** ISO (UTC) -> valor de <input type="datetime-local"> no fuso do navegador. */
function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIso(localValue: string) {
  return new Date(localValue).toISOString();
}

const CollectBiomassSection = ({
  collectId,
  cityId,
  hasEnded,
  collectMassTons
}: CollectBiomassSectionProps) => {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const canRead = hasPermission(user, "COLLECT_BIOMASS_READ");
  const canUpdate = hasPermission(user, "COLLECT_BIOMASS_UPDATE");

  const { data: biomass, isLoading } = useCollectBiomass(
    collectId,
    hasEnded && canRead
  );
  const [isOpen, setIsOpen] = useState(false);
  const { data: draft } = useBiomassDraft(collectId, isOpen && canUpdate);
  const { data: sites } = useAllDisposalSites(isOpen ? cityId : "");

  const { mutateAsync: register, isLoading: saving } =
    useRegisterBiomass(collectId);
  const { mutateAsync: remove, isLoading: removing } =
    useRemoveBiomass(collectId);

  const [masses, setMasses] = useState<Record<string, string>>({});
  const [originAddress, setOriginAddress] = useState("");
  const [originLat, setOriginLat] = useState("");
  const [originLng, setOriginLng] = useState("");
  const [siteId, setSiteId] = useState("");
  const [collectedAt, setCollectedAt] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");
  const [fuelType, setFuelType] = useState<FuelType | "">("");
  const [liters, setLiters] = useState("");

  // Preenche o formulário: registro existente tem prioridade; senão, a sugestão.
  useEffect(() => {
    if (!isOpen) return;
    if (biomass) {
      setMasses(
        Object.fromEntries(
          biomass.items.map((item) => [item.material, String(item.massKg)])
        )
      );
      setOriginAddress(biomass.origin.fullAddress);
      setOriginLat(String(biomass.origin.location.latitude));
      setOriginLng(String(biomass.origin.location.longitude));
      setSiteId(biomass.destination.siteId);
      setCollectedAt(toLocalInput(biomass.collectedAt));
      setDeliveredAt(toLocalInput(biomass.deliveredAt));
      setFuelType(biomass.fuel?.type ?? "");
      setLiters(
        biomass.fuel?.source === "MEASURED" ? String(biomass.fuel.liters) : ""
      );
    } else if (draft) {
      setOriginAddress(draft.suggestedOrigin?.fullAddress ?? "");
      setOriginLat(String(draft.suggestedOrigin?.latitude ?? ""));
      setOriginLng(String(draft.suggestedOrigin?.longitude ?? ""));
      setCollectedAt(toLocalInput(draft.collectedAt));
      setDeliveredAt(toLocalInput(draft.deliveredAt));
    }
  }, [isOpen, biomass, draft]);

  if (!hasEnded || !canRead) return null;

  const totalKg = MATERIALS.reduce(
    (sum, material) => sum + (parseFloat(masses[material]) || 0),
    0
  );

  const informedKg = (collectMassTons ?? 0) * 1000;
  const differsFromMass =
    informedKg > 0 &&
    totalKg > 0 &&
    Math.abs(totalKg - informedKg) / informedKg > 0.01;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const items = MATERIALS.map((material) => ({
      material,
      massKg: parseFloat(masses[material]) || 0
    })).filter((item) => item.massKg > 0);

    const latitude = parseFloat(originLat);
    const longitude = parseFloat(originLng);

    if (items.length === 0 || items.some((item) => item.massKg < 0)) {
      return errorToast("Informe a massa (kg) de pelo menos um material.");
    }
    if (!siteId) return errorToast("Escolha o destino.");
    if (
      !originAddress.trim() ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return errorToast("Informe a origem (endereço, latitude e longitude).");
    }
    if (!collectedAt || !deliveredAt) {
      return errorToast("Informe os horários de coleta e de entrega.");
    }
    if (new Date(deliveredAt) < new Date(collectedAt)) {
      return errorToast("A entrega não pode ser antes da coleta.");
    }

    try {
      await register({
        items,
        origin: {
          fullAddress: originAddress.trim(),
          location: { latitude, longitude }
        },
        destinationSiteId: siteId,
        collectedAt: toIso(collectedAt),
        deliveredAt: toIso(deliveredAt),
        fuel: fuelType
          ? {
              type: fuelType,
              ...(liters.trim() ? { liters: parseFloat(liters) } : {})
            }
          : null
      });
      successToast("Biomassa registrada com sucesso!");
      setIsOpen(false);
    } catch (err: any) {
      errorToast(err?.message || "Não foi possível registrar a biomassa.");
    }
  }

  async function handleRemove() {
    if (!confirm("Remover a biomassa desta coleta?")) return;
    try {
      await remove();
      successToast("Biomassa removida.");
    } catch (err: any) {
      errorToast(err?.message || "Não foi possível remover a biomassa.");
    }
  }

  return (
    <div className="space-y-6 border-t border-greenBlue-400 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Subtitle className="text-[20px]">Biomassa da coleta</Subtitle>
        {canUpdate && !isOpen && (
          <div className="flex gap-3">
            <Button className="h-fit w-fit" onClick={() => setIsOpen(true)}>
              {biomass ? "Editar biomassa" : "Registrar biomassa"}
            </Button>
            {biomass && (
              <Button
                variant="destructive"
                className="h-fit w-fit"
                loading={removing}
                onClick={handleRemove}
              >
                Remover
              </Button>
            )}
          </div>
        )}
      </div>

      {!isOpen && isLoading && <p>Carregando...</p>}

      {!isOpen && !isLoading && !biomass && (
        <p className="text-greenDark-800">
          Nenhum detalhamento registrado. É opcional: a massa da coleta já vale
          sem ele.
        </p>
      )}

      {!isOpen && biomass && <BiomassSummary biomass={biomass} />}

      {isOpen && (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <p className="mb-2 font-medium text-greenDark-800">
              Composição (kg) — total: {totalKg.toLocaleString("pt-BR")} kg
            </p>
            {informedKg > 0 && (
              <p className="mb-2 text-sm text-greenDark-800">
                Massa da coleta informada:{" "}
                {(collectMassTons ?? 0).toLocaleString("pt-BR")} t (
                {informedKg.toLocaleString("pt-BR")} kg). O detalhamento não
                altera esse valor.
              </p>
            )}
            {differsFromMass && (
              <p className="mb-2 text-sm font-medium text-amber-700">
                O total do detalhamento difere da massa informada em mais de 1%.
                Confira os valores, ou salve assim se for intencional.
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {MATERIALS.map((material) => (
                <label key={material} className="text-sm text-greenDark-800">
                  {BIOMASS_MATERIAL_LABELS[material]}
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    className={inputClass}
                    value={masses[material] ?? ""}
                    onChange={(e) =>
                      setMasses((prev) => ({
                        ...prev,
                        [material]: e.target.value
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="col-span-3 text-sm text-greenDark-800">
              Origem (endereço)
              <input
                className={inputClass}
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
              />
              {draft?.suggestedOrigin && !draft.suggestedOrigin.geocoded && (
                <span className="text-xs">
                  Endereço não localizado automaticamente; revise.
                </span>
              )}
            </label>
            <label className="text-sm text-greenDark-800">
              Latitude
              <input
                className={inputClass}
                value={originLat}
                onChange={(e) => setOriginLat(e.target.value)}
              />
            </label>
            <label className="text-sm text-greenDark-800">
              Longitude
              <input
                className={inputClass}
                value={originLng}
                onChange={(e) => setOriginLng(e.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm text-greenDark-800">
            Destino
            <Select
              className="mt-1"
              value={siteId}
              onChange={setSiteId}
              options={[
                { value: "", label: "Selecione o destino" },
                ...(sites ?? [])
                  .filter((site) => site.active || site.id === siteId)
                  .map((site) => ({ value: site.id, label: site.name }))
              ]}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-greenDark-800">
              Coletado em
              <input
                type="datetime-local"
                className={inputClass}
                value={collectedAt}
                onChange={(e) => setCollectedAt(e.target.value)}
              />
            </label>
            <label className="text-sm text-greenDark-800">
              Entregue em
              <input
                type="datetime-local"
                className={inputClass}
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-greenDark-800">
              Combustível (opcional)
              <Select
                className="mt-1"
                value={fuelType}
                onChange={(value) => setFuelType(value as FuelType | "")}
                options={[
                  { value: "", label: "Não informar" },
                  ...Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => ({
                    value,
                    label
                  }))
                ]}
              />
            </label>
            <label className="text-sm text-greenDark-800">
              Litros (vazio = estimar por consumo × km)
              <input
                type="number"
                min="0"
                step="0.001"
                className={inputClass}
                value={liters}
                disabled={!fuelType}
                placeholder={
                  draft?.estimatedFuelLiters != null
                    ? `≈ ${draft.estimatedFuelLiters}`
                    : ""
                }
                onChange={(e) => setLiters(e.target.value)}
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button buttonType="submit" className="w-fit" loading={saving}>
              Salvar biomassa
            </Button>
            <Button
              variant="outline"
              buttonType="button"
              className="w-fit"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CollectBiomassSection;
