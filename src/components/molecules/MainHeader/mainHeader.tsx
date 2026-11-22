"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu } from "lucide-react";

import LoadingComponent from "@atoms/Loading/loading";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { colors, linksAdmin, linksCity } from "./constants";

type Props = {
  /** Quando informado, mostra o botão de menu (apenas abaixo de `lg`). */
  onOpenMenu?: () => void;
};

const allLinks = [...linksCity, ...linksAdmin];

function getDetailLabel(pathname: string, baseUrl: string) {
  const rest = pathname.slice(baseUrl.length).replace(/^\//, "");
  if (!rest) return null;
  if (/cadastrar|criar/.test(rest)) return "Novo cadastro";
  return "Detalhes";
}

const MainHeader = ({ onOpenMenu }: Props) => {
  const { logoutUser, userUid } = useAuth();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: user } = useProfile(userUid);

  const isCity = user?.role === "admin";
  const cityColor = isCity
    ? colors.find((color) => color.name === user?.color)?.hex
    : undefined;

  const currentPage = allLinks
    .filter(
      (link) => pathname === link.url || pathname.startsWith(`${link.url}/`)
    )
    .sort((a, b) => b.url.length - a.url.length)[0];
  const detailLabel = currentPage
    ? getDetailLabel(pathname, currentPage.url)
    : null;

  const initials = (user?.name ?? "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-greenBlue-200/60 bg-brand-paper/90 px-4 backdrop-blur sm:px-6">
      {onOpenMenu && (
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-deep outline-none transition-colors hover:bg-greenBebe-200 focus-visible:ring-2 focus-visible:ring-brand-aqua lg:hidden"
        >
          <Menu size={22} />
        </button>
      )}

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          {!user ? (
            <LoadingComponent />
          ) : (
            <>
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Coletapp</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                {detailLabel ? (
                  <BreadcrumbLink asChild>
                    <Link href={currentPage?.url ?? "/dashboard"}>
                      {currentPage?.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-display text-base">
                    {currentPage?.label || "Página"}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {detailLabel && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{detailLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Menu da conta"
            className="flex shrink-0 items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua"
          >
            <Avatar
              className="h-10 w-10 border-2 border-brand-paper ring-2"
              style={{ ["--tw-ring-color" as string]: cityColor ?? "#00ADB4" }}
            >
              {isCity && user.image ? (
                <AvatarImage src={user.image as string} alt={user.name} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">
              {user.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-11 cursor-pointer gap-2 text-brand-deep"
              onSelect={() => {
                queryClient.clear();
                logoutUser();
              }}
            >
              <LogOut size={18} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default MainHeader;
