import type { ComponentProps } from "react";
import { cn } from "./cn";

type GroupProps = ComponentProps<"div"> & {
  layout?: "row" | "grid";
};

export function Group({ layout = "row", className, ...props }: GroupProps) {
  const display = layout === "grid" ? "grid" : "flex";
  return <div {...props} className={cn(display, className)} />;
}
