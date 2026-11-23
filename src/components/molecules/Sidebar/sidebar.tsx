"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { NavigationLink } from "@molecules/MainHeader/constants";
import { brandColors } from "@/common/constants/brandColors";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SidebarUser from "@molecules/SidebarUser/sidebarUser";
import { cn } from "@/utils";

type NavProps = {
  links: NavigationLink[];
  collapsed?: boolean;
  onNavigate?: () => void;
};

function isLinkActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      aria-label="Coletapp"
      className={cn(
        "flex shrink-0 items-center overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua",
        collapsed ? "h-10 w-10" : "h-10 w-40"
      )}
    >
      <Image
        src="/coletare-logo.png"
        alt="Coletapp"
        width={1200}
        height={320}
        priority
        className="h-10 w-auto max-w-none object-contain object-left"
      />
    </Link>
  );
}

export function SidebarNav({ links, collapsed, onNavigate }: NavProps) {
  const pathname = usePathname();

  const activeUrl = useMemo(() => {
    const matches = links
      .filter((link) => isLinkActive(pathname, link.url))
      .sort((a, b) => b.url.length - a.url.length);
    return matches[0]?.url;
  }, [links, pathname]);

  return (
    <TooltipProvider delayDuration={150}>
      <nav aria-label="Principal" className="flex flex-col gap-2">
        {links.map((link) => {
          const active = link.url === activeUrl;
          const iconSrc = link.icon(brandColors.deep);

          const item = (
            <Link
              href={link.url}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "min-h-12 relative flex items-center rounded-xl px-3 py-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-aqua",
                collapsed ? "justify-center" : "gap-3",
                active
                  ? "bg-greenAqua-200 font-semibold text-brand-deep before:absolute before:-left-3 before:top-2.5 before:h-7 before:w-1 before:rounded-full before:bg-brand-aqua"
                  : "text-brand-ink hover:bg-greenBebe-200"
              )}
            >
              <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                <Image src={iconSrc} alt="" width={22} height={22} />
                {link.alertNumber > 0 && (
                  <span className="absolute -right-3 -top-3 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-error px-1.5 text-xs font-bold leading-none text-white-900 ring-2 ring-brand-paper">
                    {link.alertNumber > 99 ? "99+" : link.alertNumber}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span className="min-w-0 flex-1 truncate leading-normal">
                  {link.label}
                </span>
              )}
            </Link>
          );

          if (!collapsed) return <div key={link.url}>{item}</div>;

          return (
            <Tooltip key={link.url}>
              <TooltipTrigger asChild>{item}</TooltipTrigger>
              <TooltipContent side="right">{link.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

type SidebarProps = {
  isOpen: boolean;
  links: NavigationLink[];
};

type SidebarToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
};

/**
 * Bolinha que sai da borda da sidebar, na altura do header/breadcrumb, para
 * recolher ou expandir o menu. Fica fora da sidebar (que corta o que passa da
 * borda) e acima do header.
 */
export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
      aria-expanded={isOpen}
      className={cn(
        "fixed top-[18px] z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-greenBlue-200 bg-brand-paper text-brand-deep shadow-md outline-none transition-[left,background-color] duration-300 ease-in-out hover:bg-greenAqua-200 focus-visible:ring-2 focus-visible:ring-brand-aqua lg:flex",
        isOpen ? "left-[calc(18rem-14px)]" : "left-[calc(5rem-14px)]"
      )}
    >
      {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}

/**
 * Sidebar fixa na viewport (sempre com a altura da tela, independente do scroll
 * da página), visível apenas a partir de `lg`. O conteúdo da página precisa de
 * margem esquerda igual à largura dela (`lg:ml-20` recolhida, `lg:ml-72` aberta).
 * No celular use MobileSidebar.
 */
export default function Sidebar({ isOpen, links }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-dvh fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden border-r border-greenBlue-200/60 bg-brand-paper transition-[width] duration-300 ease-in-out lg:flex",
        isOpen ? "w-72 px-6" : "w-20 px-4"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center",
          isOpen ? "justify-start" : "justify-center"
        )}
      >
        <Brand collapsed={!isOpen} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1 pb-4 pt-3">
        <SidebarNav links={links} collapsed={!isOpen} />
      </div>

      <div className="mt-auto shrink-0 border-t border-greenBlue-200/60 py-2">
        <SidebarUser collapsed={!isOpen} menuSide="right" />
      </div>
    </aside>
  );
}

type MobileSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: NavigationLink[];
};

/** Gaveta de navegação para telas pequenas. Fecha ao trocar de rota. */
export function MobileSidebar({
  open,
  onOpenChange,
  links
}: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="gap-0 p-0">
        <SheetHeader className="px-6 pb-4 pt-5">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navegação principal do Coletapp
          </SheetDescription>
          <Brand />
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">
          <SidebarNav links={links} onNavigate={() => onOpenChange(false)} />
        </div>
        <div className="mt-auto shrink-0 border-t border-greenBlue-200/60 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <SidebarUser menuSide="top" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
