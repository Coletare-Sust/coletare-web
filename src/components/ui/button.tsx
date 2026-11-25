import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-white-1000 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-greenBlue-1000 text-white-1000 hover:bg-greenBlue-800",
        destructive: "bg-error text-white-1000 hover:bg-error/90",
        outline:
          "border border-greenBlue-800 bg-white-1000 text-greenBlue-1000 hover:bg-greenAqua-200",
        secondary:
          "bg-greenAqua-200 text-greenBlue-1000 hover:bg-greenAqua-400",
        ghost: "text-greenBlue-1000 hover:bg-greenAqua-200",
        link: "text-greenBlue-1000 underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-10 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
