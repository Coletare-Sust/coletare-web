"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { renderToString } from "react-dom/server";
import { LogOutIcon } from "lucide-react";

import LoadingComponent from "@atoms/Loading/loading";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

import { colors, linksAdmin, linksCity } from "./constants";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  isOpen: boolean;
  hideSidebar?: boolean;
};

const MainHeader = ({ isOpen, hideSidebar }: Props) => {
  const { logoutUser, userUid } = useAuth();
  const currentPathname = usePathname();
  const queryClient = useQueryClient();
  const { data: user } = useProfile(userUid);

  const isCity = user?.role === "admin";
  const links = isCity ? linksCity : linksAdmin;

  const headerColor = isCity
    ? colors.find((color) => color.name === user?.color)?.hex
    : "#004A55";

  const svgLogoutString = renderToString(<LogOutIcon color={headerColor} />);
  const logoutSrc = `data:image/svg+xml;base64,${Buffer.from(
    svgLogoutString
  ).toString("base64")}`;

  const currentPage = links.find((link) =>
    currentPathname.startsWith(link.url)
  );
  const currentPageIcon = currentPage?.icon(headerColor);

  return (
    <header
      style={{
        width: hideSidebar
          ? "100%"
          : (isOpen ? "calc(100% - 288px)" : "calc(100% - 80px)"),
        transition: "all 0.3s ease-in-out"
      }}
      className="fixed right-0 top-0 z-50 border-b border-greenDark-400 bg-white-800 p-4"
    >
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {!user ? (
            <LoadingComponent />
          ) : (
            <div className="flex items-center gap-2">
              {currentPageIcon && (
                <Image
                  src={currentPageIcon}
                  alt="page-icon"
                  width={24}
                  height={24}
                />
              )}
              <span
                className="text-base font-medium"
                style={{ color: headerColor }}
              >
                {currentPage?.label || "Página"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          {!user ? (
            <LoadingComponent />
          ) : (
            <Image
              src={isCity ? (user.image as string) : "/sicol-logo.svg"}
              alt="logo"
              width={isCity ? 120 : 40}
              height={40}
              className={`h-[40px] object-contain ${
                isCity ? "w-[120px]" : "w-[40px]"
              }`}
              unoptimized={isCity}
              priority
            />
          )}
          <div
            className="flex cursor-pointer items-center gap-2 transition-all hover:opacity-80"
            style={{ color: headerColor }}
            onClick={() => {
              queryClient.clear();
              logoutUser();
            }}
          >
            <p className="text-base font-medium">Sair</p>
            <Image src={logoutSrc} alt="logout" width={24} height={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
