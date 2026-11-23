import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";

const groupStyles = cva(null, {
  variants: {
    layout: {
      row: "flex",
      grid: "grid",
    },
    variant: {
      plain: null,
      framed: "rounded-lg border border-ui-line",
      floating: "floating-surface rounded-lg",
    },
  },
  defaultVariants: { layout: "row", variant: "plain" },
});

type GroupProps = ComponentProps<"div"> & VariantProps<typeof groupStyles>;

export function Group({ layout, variant, className, ...props }: GroupProps) {
  return (
    <div {...props} className={cn(groupStyles({ layout, variant }), className)} />
  );
}
