import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        outline: "border border-line-strong bg-paper text-ink-muted",
        blush: "bg-blush text-accent-deep",
        sand: "bg-sand-soft text-ink-muted",
        ink: "bg-primary text-white",
      },
      size: {
        sm: "h-6 px-2.5 text-[0.6875rem] tracking-wide uppercase",
        md: "h-7 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
