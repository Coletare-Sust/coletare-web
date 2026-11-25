"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/utils";

type MapPanelProps = {
  children: React.ReactNode;
  /** Posicionamento/tamanho no desktop (ex.: `lg:left-8 lg:top-8 lg:h-[...]`). */
  className?: string;
  defaultExpanded?: boolean;
  /** Nome do painel, usado nos rótulos do botão de recolher. */
  label?: string;
};

/**
 * Painel que flutua sobre um mapa.
 * - Desktop (`lg`+): painel flutuante no canto, posicionado por `className`.
 * - Celular/tablet: acoplado à base do mapa, com uma alça para recolher e
 *   deixar o mapa livre para toques.
 *
 * Deve ser filho de um contêiner `relative` com a altura do mapa.
 */
export default function MapPanel({
  children,
  className,
  defaultExpanded = true,
  label = "painel"
}: MapPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-10 rounded-t-3xl bg-white-1000 shadow-[0_-12px_32px_-12px_rgba(0,74,85,0.45)]",
        "lg:inset-x-auto lg:bottom-auto lg:w-full lg:max-w-[480px] lg:rounded-none lg:bg-transparent lg:shadow-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={contentId}
        aria-label={expanded ? `Recolher ${label}` : `Mostrar ${label}`}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-t-3xl text-sm font-medium text-greenBlue-1000 outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua lg:hidden"
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-12 rounded-full bg-brand-deep/25"
        />
        {!expanded && (
          <span className="flex items-center gap-1">
            Mostrar {label}
            <ChevronDown className="h-4 w-4 rotate-180" />
          </span>
        )}
      </button>
      <div
        id={contentId}
        className={cn("lg:h-full", !expanded && "max-lg:hidden")}
      >
        {children}
      </div>
    </div>
  );
}
