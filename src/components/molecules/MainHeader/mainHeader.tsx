"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { renderToString } from "react-dom/server";
import { LogOutIcon } from "lucide-react";

import LoadingComponent from "@atoms/Loading/loading";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

import { wrapper } from "@/common/constants/wrapper";
import { colors, linksAdmin, linksCity } from "./constants";
import useAllWithdrawalsRequest from "@/hooks/queries/useAllWithdrawalsRequests";
import { useQueryClient } from "@tanstack/react-query";

const MainHeader = () => {
  const { logoutUser } = useAuth();
  const currentPathname = usePathname();
  const { userUid } = useAuth();
  const queryClient = useQueryClient();
  const { data: user } = useProfile(userUid);
  const isCity = user?.role === "admin";
  let links = isCity ? linksCity : linksAdmin;

  const headerColor = isCity
    ? colors.find((color) => color.name === user.color)?.hex
    : "#004A55";

  const svgString = renderToString(<LogOutIcon color={headerColor} />);
  const logoutSrc = `data:image/svg+xml;base64,${Buffer.from(
    svgString
  ).toString("base64")}`;

  const { data: solicitationsData } = useAllWithdrawalsRequest(
    user?.id as string
  );
  const openedSolicitations = solicitationsData?.filter((s) => !s.isResolved);

  if (isCity && openedSolicitations?.length && openedSolicitations?.length > 0)
    links = links.map((link) =>
      link.url === "/solicitacoes-retirada"
        ? { ...link, alertNumber: openedSolicitations.length }
        : link
    );

  return (
    <header className="fixed top-0 z-50 w-full bg-white-800 p-4">
      <div style={wrapper}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-16">
            {!user ? (
              <LoadingComponent />
            ) : (
              <Image
                src={isCity ? (user.image as string) : "/sicol-logo.svg"}
                alt="logo"
                width={isCity ? 160 : 50}
                height={60}
                className={`h-[60px] cursor-pointer object-contain ${
                  isCity ? "w-[160px]" : "w-[50px]"
                }`}
                unoptimized={isCity}
                priority
              />
            )}
            <nav>
              <ul
                className="flex
                  flex-nowrap
                  items-center
                  justify-start
                  gap-10
                  whitespace-nowrap
                "
              >
                {links.map((link, index) => {
                  const isCurrentRoute = currentPathname.startsWith(link.url);
                  const iconSrc = link.icon(headerColor);

                  return (
                    <li key={index}>
                      <Link
                        href={link.url}
                        className={`relative flex items-center gap-2 text-base transition-all hover:opacity-80 ${
                          isCurrentRoute ? "underline" : ""
                        } ${
                          isCurrentRoute &&
                          currentPathname === "/solicitacoes-retirada" &&
                          "pointer-events-none"
                        }`}
                        style={{
                          color: headerColor
                        }}
                      >
                        {/* Ícone */}
                        <Image
                          src={iconSrc}
                          alt="Ícone do item"
                          width={22}
                          height={22}
                          className="block"
                        />

                        {/* Texto */}
                        <span className="leading-none">{link.label}</span>

                        {/* Badge (notificação) */}
                        {link.alertNumber !== -1 && (
                          <span className="absolute -right-5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[12px] text-[#fff]">
                            {link.alertNumber}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <div
            className={`ml-8 flex cursor-pointer items-center gap-2 transition-all hover:opacity-80 ${
              !isCity && "text-greenBlue-1000"
            }`}
            style={{
              color: headerColor
            }}
            onClick={() => {
              queryClient.clear();
              logoutUser();
            }}
          >
            <p>Sair</p>
            <Image src={logoutSrc} alt="logo" width={24} height={24} />
          </div>
        </div>
      </div>
      <span className="absolute bottom-0 left-0 w-full border-b-[1px] border-greenDark-400"></span>
    </header>
  );
};

export default MainHeader;
