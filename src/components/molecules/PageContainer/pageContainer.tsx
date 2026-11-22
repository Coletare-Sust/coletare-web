import { cn } from "@/utils";

type PageContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "div";
};

/**
 * Contêiner padrão de página: largura máxima e espaçamento vertical
 * consistentes. O espaçamento lateral vem do `<main>` do layout autenticado.
 */
export default function PageContainer({
  as: Tag = "section",
  className,
  ...props
}: PageContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto flex w-full max-w-[1377px] flex-col gap-6 py-2 sm:gap-8 sm:py-6",
        className
      )}
      {...props}
    />
  );
}
