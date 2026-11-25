"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { successToast, errorToast } from "@/hooks/useAppToast";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import Input from "@atoms/Input/input";
import LoadingComponent from "@atoms/Loading/loading";
import { AccordionChildren } from "@atoms/Accordion/accordion";
import { wrapper } from "@/common/constants/wrapper";
import { hasPermission } from "@/common/accessControl/permissions";
import {
  DISPOSAL_SITE_TYPE_LABELS,
  getDisposalSiteTypeLabel
} from "@/common/mappers/backendEnums";
import type {
  DisposalSite,
  DisposalSiteType
} from "@/store/services/disposalSite";

import usePaginatedDisposalSites from "@/hooks/queries/disposalSite/usePaginatedDisposalSites";
import useUpdateDisposalSite from "@/hooks/queries/disposalSite/useUpdateDisposalSite";
import useDeleteDisposalSite from "@/hooks/queries/disposalSite/useDeleteDisposalSite";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import PaginationControls from "@/components/molecules/PaginationControls/paginationControls";
import { Badge } from "@/components/ui/badge";
import LocationDetail from "@/components/molecules/LocationDetail/LocationDetail";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";
import Dropdown from "@atoms/Dropdown/dropdown";

const PAGE_SIZE = 10;

const DestinosPage = () => {
  const router = useRouter();
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const cityId = user?.id as string;

  const { mutateAsync: deleteSite, isLoading: deleting } =
    useDeleteDisposalSite(cityId);
  const { mutateAsync: updateSite } = useUpdateDisposalSite(cityId);

  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<DisposalSiteType | "">("");
  const [page, setPage] = useState(0);
  const [openItem, setOpenItem] = useState("");
  const [siteToDelete, setSiteToDelete] = useState<DisposalSite | null>(null);

  const filters = useMemo(
    () => ({ name: nameFilter, type: typeFilter || undefined }),
    [nameFilter, typeFilter]
  );

  const { data: sitesPage, isLoading } = usePaginatedDisposalSites(
    cityId,
    page,
    PAGE_SIZE,
    filters
  );
  const sites = sitesPage?.content ?? [];

  useEffect(() => {
    setPage(0);
  }, [nameFilter, typeFilter]);

  async function handleConfirmDelete() {
    if (!siteToDelete) return;
    try {
      await deleteSite(siteToDelete.id);
      successToast("Destino excluído com sucesso!");
    } catch (err: any) {
      errorToast(err?.message || "Erro ao excluir destino.");
    } finally {
      setSiteToDelete(null);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await updateSite({ id, body: { active: !active } });
      successToast(active ? "Destino desativado." : "Destino ativado.");
    } catch (err: any) {
      errorToast(err?.message || "Erro ao atualizar destino.");
    }
  }

  const canCreate = hasPermission(user, "DISPOSAL_SITE_CREATE");
  const canUpdate = hasPermission(user, "DISPOSAL_SITE_UPDATE");
  const canDelete = hasPermission(user, "DISPOSAL_SITE_DELETE");

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-14">
        <Title>Destinos de resíduos</Title>

        {canCreate && (
          <Button
            classNameText="flex items-center gap-2"
            onClick={() => router.push("/destinos/cadastrar")}
          >
            <Image
              src="/icon-plus-white.svg"
              alt="icone"
              width={26}
              height={26}
            />
            Cadastrar destino
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end">
        <Input
          value={nameFilter}
          onChange={(event) => setNameFilter(event.target.value)}
          placeholder="Buscar por nome"
          name="nameFilter"
          className="w-full sm:w-72"
        />
        <Dropdown
          className="sm:w-64"
          value={
            typeFilter ? getDisposalSiteTypeLabel(typeFilter) : "Todos os tipos"
          }
          options={[
            { label: "Todos os tipos", onClick: () => setTypeFilter("") },
            ...Object.entries(DISPOSAL_SITE_TYPE_LABELS).map(
              ([value, label]) => ({
                label,
                onClick: () => setTypeFilter(value as DisposalSiteType)
              })
            )
          ]}
        />
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : sites.length === 0 ? (
        <p className="text-lg font-medium text-greenDark-800">
          Nenhum destino cadastrado para este município.
        </p>
      ) : (
        <>
          <AccordionChildren
            openItem={openItem}
            setOpenItem={setOpenItem}
            items={sites.map((site) => ({
              title: site.name,
              properties: [
                { prop: "Endereço", answer: site.address || "N/A" },
                { prop: "Tipo", answer: getDisposalSiteTypeLabel(site.type) },
                {
                  prop: "Situação",
                  answer: (
                    <Badge variant={site.active ? "success" : "neutral"}>
                      {site.active ? "Ativo" : "Inativo"}
                    </Badge>
                  )
                }
              ],
              children: (
                <LocationDetail
                  lat={site.lat}
                  lng={site.lng}
                  address={site.address}
                  showCoordinates={false}
                  info={
                    <p className="mb-4 flex items-center gap-3 text-greenDark-800">
                      <span>
                        <strong>Tipo:</strong>{" "}
                        {getDisposalSiteTypeLabel(site.type)}
                      </span>
                      <Badge variant={site.active ? "success" : "neutral"}>
                        {site.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </p>
                  }
                  actions={
                    (canUpdate || canDelete) && (
                      <>
                        {canUpdate && (
                          <>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2 px-6 py-2"
                              classNameText="font-semibold"
                              onClick={() =>
                                router.push(
                                  `/destinos/cadastrar?isEdit=true&siteId=${site.id}`
                                )
                              }
                            >
                              Editar
                            </Button>
                            <Button
                              variant="secondary"
                              className="flex items-center gap-2 px-6 py-2"
                              classNameText="font-semibold"
                              onClick={() =>
                                handleToggleActive(site.id, site.active)
                              }
                            >
                              {site.active ? "Desativar" : "Ativar"}
                            </Button>
                          </>
                        )}
                        {canDelete && (
                          <Button
                            variant="destructive"
                            className="flex items-center gap-2 px-6 py-2"
                            classNameText="font-semibold"
                            onClick={() => setSiteToDelete(site)}
                          >
                            Excluir
                          </Button>
                        )}
                      </>
                    )
                  }
                />
              )
            }))}
            itemClassName="mb-4"
            triggerClassName={`
              bg-white-1000 border border-greenBlue-400
              py-4 px-4
              grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 items-center
              rounded-lg
              data-[state=open]:rounded-b-none
              data-[state=open]:border-b-0
              transition-all
            `}
            contentClassName="bg-white-800 border border-greenBlue-400 border-t-0 py-8 px-6 rounded-b-lg"
          />

          <div className="mt-8">
            <PaginationControls
              page={page}
              totalPages={sitesPage?.totalPages ?? 0}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={Boolean(siteToDelete)}
        onOpenChange={(open) => !open && setSiteToDelete(null)}
        onConfirm={handleConfirmDelete}
        confirmIsLoading={deleting}
        destructive
        title="Excluir destino"
        description={`Tem certeza que deseja excluir "${siteToDelete?.name}"? As coletas já registradas mantêm o histórico.`}
      />
    </div>
  );
};

export default DestinosPage;
