import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const groupStyles = cva(null, {
  variants: {
    layout: {
      row: "flex",
      grid: "grid",
    },
    radius: radiusVariants,
    variant: {
      plain: null,
      framed: "border border-ui-line",
      floating: "floating-surface",
    },
  },
  defaultVariants: { layout: "row", variant: "plain", radius: defaultRadius },
});

type GroupProps = ComponentProps<"div"> & VariantProps<typeof groupStyles>;

export function Group({ layout, variant, radius, className, ...props }: GroupProps) {
  return (
    <div
      {...props}
      className={cn(groupStyles({ layout, variant, radius }), className)}
    />
  );
}
