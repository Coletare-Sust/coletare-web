"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

import BlockInactiveUserWrapper from "@/components/templates/BlockInactiveUser/blockInactiveUser";
import AuthenticatedOnlyFeatureWrapper from "@/components/templates/Authenticated/authenticated";
import MainHeader from "@molecules/MainHeader/mainHeader";
import Sidebar, { MobileSidebar } from "@molecules/Sidebar/sidebar";
import LoadingComponent from "@/components/atoms/Loading/loading";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useWithdrawalRequestCount from "@/hooks/queries/useWithdrawalRequestCount";
import { canAccessAll } from "@/common/accessControl/permissions";
import { getRouteAccessRule } from "@/common/accessControl/routes";

import { linksAdmin, linksCity } from "@molecules/MainHeader/constants";
import { cn } from "@/utils";

const libraries: Libraries = ["places", "geometry", "drawing", "visualization"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries
  });

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const baseLinks = [...linksCity, ...linksAdmin];

  const { data: openedSolicitationsCount = 0 } = useWithdrawalRequestCount(
    user?.id as string
  );

  const linksComNotificacao = baseLinks
    .filter((link) => canAccessAll(user, link.permissions))
    .filter(
      (link, index, links) =>
        links.findIndex((item) => item.url === link.url) === index
    )
    .filter((link) => !link.hiddenInSidebar)
    .map((link) => {
      if (
        link.url === "/solicitacoes-retirada" &&
        openedSolicitationsCount > 0
      ) {
        return { ...link, alertNumber: openedSolicitationsCount };
      }
      return link;
    });

  const rotasComSidebar = [
    "/dashboard",
    "/rotas",
    "/ecopontos",
    "/destinos",
    "/integracoes",
    "/solicitacoes-retirada",
    "/veiculos-colaboradores",
    "/avisos",
    "/rotas-andamento",
    "/municipios",
    "/permissoes"
  ];
  const deveMostrarSidebar = rotasComSidebar.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const routeAccessRule = getRouteAccessRule(pathname);
  const canAccessCurrentRoute =
    !routeAccessRule || canAccessAll(user, routeAccessRule.permissions);

  const renderContent = () => {
    if (loadError) {
      console.warn("Google Maps nao pode ser carregado:", loadError);

      return (
        <div className="flex h-full min-h-[320px] items-center justify-center text-center text-greenDark-800">
          Nao foi possivel carregar o Google Maps. Verifique a chave de API.
        </div>
      );
    }
    if (user && !canAccessCurrentRoute) {
      return (
        <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-2xl font-semibold text-brand-strong">
            Acesso restrito
          </h1>
          <p className="max-w-md text-sm text-brand-ink">
            Seu usuario nao possui permissao para acessar esta tela.
          </p>
        </section>
      );
    }

    if (!isLoaded) {
      return (
        <div className="flex h-full min-h-[320px] items-center justify-center">
          <LoadingComponent color="#004A55" size={32} />
        </div>
      );
    }

    return children;
  };

  return (
    <AuthenticatedOnlyFeatureWrapper>
      <BlockInactiveUserWrapper>
        <div className="h-dvh flex overflow-hidden bg-white-800">
          {deveMostrarSidebar && (
            <>
              <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                links={linksComNotificacao}
              />
              <MobileSidebar
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
                links={linksComNotificacao}
              />
            </>
          )}

          <div
            className={cn(
              "relative flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden transition-[margin] duration-300 ease-in-out",
              deveMostrarSidebar && (isSidebarOpen ? "lg:ml-72" : "lg:ml-20")
            )}
          >
            <MainHeader
              onOpenMenu={
                deveMostrarSidebar ? () => setIsMobileMenuOpen(true) : undefined
              }
              showAccount={!deveMostrarSidebar}
            />

            <main className="flex-1 p-4 sm:p-6 lg:px-8">{renderContent()}</main>
          </div>
        </div>
      </BlockInactiveUserWrapper>
    </AuthenticatedOnlyFeatureWrapper>
  );
}
