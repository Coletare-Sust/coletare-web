"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import LoadingComponent from "@atoms/Loading/loading";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

import SidebarUser from "@molecules/SidebarUser/sidebarUser";
import { linksAdmin, linksCity } from "./constants";

type Props = {
  /** Mostra o menu da conta no header (quando não há sidebar). */
  showAccount?: boolean;
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

const MainHeader = ({ onOpenMenu, showAccount }: Props) => {
  const { userUid } = useAuth();
  const pathname = usePathname();
  const { data: user } = useProfile(userUid);

  const currentPage = allLinks
    .filter(
      (link) => pathname === link.url || pathname.startsWith(`${link.url}/`)
    )
    .sort((a, b) => b.url.length - a.url.length)[0];
  const detailLabel = currentPage
    ? getDetailLabel(pathname, currentPage.url)
    : null;

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

      {showAccount && (
        <div className="w-14 shrink-0">
          <SidebarUser collapsed menuSide="bottom" />
        </div>
      )}
    </header>
  );
};

export default MainHeader;
