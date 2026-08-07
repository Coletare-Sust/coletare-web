"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

import BlockInactiveUserWrapper from "@/components/templates/BlockInactiveUser/blockInactiveUser";
import AuthenticatedOnlyFeatureWrapper from "@/components/templates/Authenticated/authenticated";
import MainHeader from "@molecules/MainHeader/mainHeader";
import Sidebar from "@molecules/Sidebar/sidebar";
import LoadingComponent from "@/components/atoms/Loading/loading";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useWithdrawalRequestCount from "@/hooks/queries/useWithdrawalRequestCount";

import { colors, linksAdmin, linksCity } from "@molecules/MainHeader/constants";

const libraries: Libraries = ["places", "geometry", "drawing", "visualization"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries
  });

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const isCity = user?.role === "admin";
  const baseLinks = isCity ? linksCity : linksAdmin;

  const { data: openedSolicitationsCount = 0 } = useWithdrawalRequestCount(
    user?.id as string
  );

  const linksComNotificacao = baseLinks
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
    "/municipios"
  ];
  const deveMostrarSidebar = rotasComSidebar.includes(pathname);

  const renderContent = () => {
    if (loadError) {
      console.warn("Google Maps nao pode ser carregado:", loadError);

      return (
        <div className="flex h-full min-h-[320px] items-center justify-center text-center text-greenDark-800">
          Nao foi possivel carregar o Google Maps. Verifique a chave de API.
        </div>
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
