import { cn } from "@/utils";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-greenBlue-800/20 px-4 py-4 text-center text-xs text-brand-muted sm:px-6 lg:px-8",
        className
      )}
    >
      <p>© {currentYear} Pegasus Ambiental. Todos os direitos reservados.</p>
    </footer>
  );
}
