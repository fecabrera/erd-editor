import type { ComponentProps } from "react";
import { cn } from "./cn";

type CardProps = ComponentProps<"div"> & {
  as?: "div" | "section" | "article";
};

export function Card({ as: Element = "div", className, ...props }: CardProps) {
  return (
    <Element
      {...props}
      className={cn("pane rounded-ui", className)}
    />
  );
}
