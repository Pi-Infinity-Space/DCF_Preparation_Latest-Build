import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
  {
    variants: {
      variant: {
        primary: "bg-navy text-navy-fg hover:opacity-92",
        secondary: "bg-paper text-ink border border-line hover:bg-bg",
        ghost: "bg-transparent text-ink hover:bg-paper",
        gold: "bg-gold text-paper hover:opacity-92",
        danger: "bg-bad text-paper hover:opacity-92",
      },
      size: {
        sm: "h-10 px-3 text-sm rounded-md",
        md: "h-12 px-4 text-sm rounded-lg",
        lg: "h-14 px-5 text-base rounded-xl",
        icon: "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
