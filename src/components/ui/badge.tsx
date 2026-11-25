import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

// Badge no padrão shadcn/ui. As variantes semânticas cobrem os status do painel.
const badgeVariants = cva(
  "inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-greenBlue-1000 text-white-900",
        secondary: "border-transparent bg-greenBebe-400 text-greenBlue-1000",
        success: "border-green-200 bg-green-100 text-green-800",
        warning: "border-amber-200 bg-amber-100 text-amber-800",
        destructive: "border-red-200 bg-red-100 text-red-800",
        neutral: "border-slate-200 bg-slate-100 text-slate-700",
        outline: "border-greenBlue-800 text-greenBlue-1000"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
