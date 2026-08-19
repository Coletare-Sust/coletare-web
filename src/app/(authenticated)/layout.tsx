"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

import BlockInactiveUserWrapper from "@/components/templates/BlockInactiveUser/blockInactiveUser";
import AuthenticatedOnlyFeatureWrapper from "@/components/templates/Authenticated/authenticated";
import MainHeader from "@molecules/MainHeader/mainHeader";
import Sidebar from "@molecules/Sidebar/sidebar";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useWithdrawalRequestCount from "@/hooks/queries/useWithdrawalRequestCount";
import { canAccessAll } from "@/common/accessControl/permissions";
import { getRouteAccessRule } from "@/common/accessControl/routes";

import { colors, linksAdmin, linksCity } from "@molecules/MainHeader/constants";

const libraries: Libraries = ["places", "geometry", "drawing", "visualization"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const isCity = user?.role === "admin";
  const baseLinks = [...linksCity, ...linksAdmin].filter(
    (link, index, links) =>
      links.findIndex((item) => item.url === link.url) === index,
  );

  const { data: openedSolicitationsCount = 0 } = useWithdrawalRequestCount(
    user?.id as string,
  );

  const linksComNotificacao = baseLinks
    .filter((link) => canAccessAll(user, link.permissions))
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

  const headerColor = isCity
    ? colors.find((color) => color.name === user?.color)?.hex || "#004A55"
    : "#004A55";

  const rotasComSidebar = [
    "/dashboard",
    "/rotas",
    "/ecopontos",
    "/solicitacoes-retirada",
    "/veiculos-colaboradores",
    "/avisos",
    "/rotas-andamento",
    "/municipios",
    "/permissoes",
  ];
  const deveMostrarSidebar = rotasComSidebar.includes(pathname);
  const routeAccessRule = getRouteAccessRule(pathname);
  const canAccessCurrentRoute =
    !routeAccessRule || canAccessAll(user, routeAccessRule.permissions);

  const renderContent = () => {
    // Maps não bloqueia o render da página — componentes que usam Maps
    // tratam o estado de carregamento internamente.
    // loadError é logado mas não impede a navegação.
    if (loadError) {
      console.warn("Google Maps não pôde ser carregado:", loadError);
    }
    if (user && !canAccessCurrentRoute) {
      return (
        <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Acesso restrito
          </h1>
          <p className="max-w-md text-sm text-gray-500">
            Seu usuario nao possui permissao para acessar esta tela.
          </p>
        </section>
      );
    }

    return children;
  };

  return (
    <AuthenticatedOnlyFeatureWrapper>
      <BlockInactiveUserWrapper>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          {deveMostrarSidebar && (
            <aside className="sticky top-0 z-50 h-screen">
              <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                links={linksComNotificacao}
                headerColor={headerColor}
              />
            </aside>
          )}

          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300">
            <MainHeader
              isOpen={deveMostrarSidebar ? isSidebarOpen : false}
              hideSidebar={!deveMostrarSidebar}
            />

            <main
              className={`
              flex-1 p-6 transition-all duration-300
              ${!deveMostrarSidebar ? "w-full" : ""}
            `}
            >
              {renderContent()}
            </main>
          </div>
        </div>
      </BlockInactiveUserWrapper>
    </AuthenticatedOnlyFeatureWrapper>
  );
}
