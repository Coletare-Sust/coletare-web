"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronsUpDown, LogOut } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";
import { cn } from "@/utils";

const ROLE_LABELS: Record<string, string> = {
  admin: "Prefeitura",
  platformAdmin: "Administrador da plataforma",
  employee: "Colaborador",
  vehicle: "Veículo",
  citizen: "Cidadão"
};

type SidebarUserProps = {
  /** Mostra só a foto (sidebar recolhida). */
  collapsed?: boolean;
  /** Lado em que o menu abre. */
  menuSide?: "top" | "right" | "bottom";
};

function getInitials(name?: string) {
  return (name ?? "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Foto, nome e menu de ações da conta, no rodapé da sidebar. */
export default function SidebarUser({
  collapsed,
  menuSide = "top"
}: SidebarUserProps) {
  const { logoutUser, userUid } = useAuth();
  const queryClient = useQueryClient();
  const { data: user } = useProfile(userUid);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        {!collapsed && <Skeleton className="h-8 flex-1" />}
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[user.role] ?? "";
  const image = user.image as string | null;

  const avatar = (
    <Avatar className="h-10 w-10 shrink-0 border-2 border-brand-paper ring-2 ring-brand-aqua">
      {image ? <AvatarImage src={image} alt={user.name} /> : null}
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          aria-label="Menu da conta"
          className={cn(
            "flex w-full items-center rounded-xl p-2 text-left outline-none transition-colors hover:bg-greenBebe-200 focus-visible:ring-2 focus-visible:ring-brand-aqua data-[state=open]:bg-greenBebe-200",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          {avatar}
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-brand-deep">
                  {user.name}
                </span>
                {(user.email || roleLabel) && (
                  <span className="block truncate text-xs text-brand-ink">
                    {user.email ?? roleLabel}
                  </span>
                )}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-brand-ink" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={menuSide}
          align={
            menuSide === "right"
              ? "end"
              : menuSide === "bottom"
              ? "end"
              : "center"
          }
          sideOffset={10}
          className="z-[90] w-64 rounded-xl p-1"
        >
          <DropdownMenuLabel className="flex items-center gap-3 p-2 font-normal">
            {avatar}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-brand-deep">
                {user.name}
              </span>
              {roleLabel && (
                <span className="block truncate text-xs text-brand-ink">
                  {roleLabel}
                </span>
              )}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="min-h-11 cursor-pointer gap-2 rounded-lg text-brand-deep"
              onSelect={() => setIsLogoutModalOpen(true)}
            >
              <LogOut size={18} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        title="Sair da conta?"
        description="Você precisará entrar novamente para acessar o painel."
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          queryClient.clear();
          logoutUser();
        }}
      />
    </>
  );
}
