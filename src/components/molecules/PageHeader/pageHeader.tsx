import { cn } from "@/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Ações da página (botões). Quebram para a linha de baixo no celular. */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Cabeçalho de página: título em Unbounded, descrição opcional e ações.
 * O divisor pontilhado com parada ecoa a rota da tela de login.
 */
export default function PageHeader({
  title,
  description,
  actions,
  className
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold leading-tight text-greenBlue-1000 sm:text-[30px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-prose text-sm text-brand-ink sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
      <div aria-hidden="true" className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-aqua" />
        <span className="h-0 flex-1 border-t-2 border-dotted border-brand-aqua/40" />
      </div>
    </header>
  );
}
