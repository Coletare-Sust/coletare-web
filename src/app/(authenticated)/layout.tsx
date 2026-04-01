"use client";

import { useState } from "react";

import BlockInactiveUserWrapper from "@/components/templates/BlockInactiveUser/blockInactiveUser";
import AuthenticatedOnlyFeatureWrapper from "@/components/templates/Authenticated/authenticated";
import MainHeader from "@molecules/MainHeader/mainHeader";
import Sidebar from "@molecules/Sidebar/sidebar";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import useAllWithdrawalsRequest from "@/hooks/queries/useAllWithdrawalsRequests";
import { usePathname } from "next/navigation";

import { colors, linksAdmin, linksCity } from "@molecules/MainHeader/constants";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const isCity = user?.role === "admin";
  const baseLinks = isCity ? linksCity : linksAdmin;

  const { data: solicitationsData } = useAllWithdrawalsRequest(
    user?.id as string
  );

  const openedSolicitationsCount =
    solicitationsData?.filter((s) => !s.isResolved).length || 0;

  const linksComNotificacao = baseLinks.map((link) => {
    if (link.url === "/solicitacoes-retirada" && openedSolicitationsCount > 0) {
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
    "/avisos"
  ];
  const deveMostrarSidebar = rotasComSidebar.includes(pathname);
  return (
    <AuthenticatedOnlyFeatureWrapper>
      <BlockInactiveUserWrapper>
        <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
          {deveMostrarSidebar && (
            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              links={linksComNotificacao}
              headerColor={headerColor}
            />
          )}
          <div className="relative flex flex-1 flex-col transition-all duration-300">
          <MainHeader
              isOpen={deveMostrarSidebar ? isSidebarOpen : false}
              hideSidebar={!deveMostrarSidebar}
          />
            <main className={`
              flex-1 transition-all duration-300 mt-[76px] p-6
              ${!deveMostrarSidebar ? "w-full" : ""}
            `}>
              {children}
            </main>
          </div>
        </div>
      </BlockInactiveUserWrapper>
    </AuthenticatedOnlyFeatureWrapper>
  );
}
