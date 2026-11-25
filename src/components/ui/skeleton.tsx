import { cn } from "@/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-brand-mint/60 motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
