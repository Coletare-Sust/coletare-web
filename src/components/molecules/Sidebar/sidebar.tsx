"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

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
      <nav aria-label="Principal" className="flex flex-col gap-1">
        {links.map((link) => {
          const active = link.url === activeUrl;
          const iconSrc = link.icon(brandColors.deep);

          const item = (
            <Link
              href={link.url}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "min-h-12 relative flex items-center rounded-xl px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-aqua",
                collapsed ? "justify-center" : "gap-3",
                active
                  ? "bg-greenAqua-200 font-semibold text-brand-deep before:absolute before:-left-3 before:top-2.5 before:h-7 before:w-1 before:rounded-full before:bg-brand-aqua"
                  : "text-brand-ink hover:bg-greenBebe-200"
              )}
            >
              <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                <Image src={iconSrc} alt="" width={22} height={22} />
                {link.alertNumber > 0 && (
                  <span className="text-white absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold">
                    {link.alertNumber}
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
  toggleSidebar: () => void;
  links: NavigationLink[];
};

/** Sidebar fixa, visível apenas a partir de `lg`. No celular use MobileSidebar. */
export default function Sidebar({
  isOpen,
  toggleSidebar,
  links
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "relative z-30 hidden h-full shrink-0 flex-col border-r border-greenBlue-200/60 bg-brand-paper transition-[width] duration-300 ease-in-out lg:flex",
        isOpen ? "w-72 px-6" : "w-20 px-4"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center",
          isOpen ? "justify-between" : "justify-center"
        )}
      >
        <Brand collapsed={!isOpen} />
      </div>

      <div className="mt-4 flex-1 overflow-y-auto overflow-x-hidden pb-4">
        <SidebarNav links={links} collapsed={!isOpen} />
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
        aria-expanded={isOpen}
        className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-greenBlue-200 bg-brand-paper text-brand-deep shadow-sm outline-none transition-colors hover:bg-greenAqua-200 focus-visible:ring-2 focus-visible:ring-brand-aqua"
      >
        {isOpen ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
      </button>
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
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <SidebarNav links={links} onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
