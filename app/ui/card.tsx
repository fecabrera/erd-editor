import type { ComponentProps } from "react";
import { cn } from "./cn";

type CardProps = ComponentProps<"div"> & {
  as?: "div" | "section" | "article";
};

function CardRoot({ as: Element = "div", className, ...props }: CardProps) {
  return (
    <Element
      {...props}
      className={cn("pane rounded-ui", className)}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("min-h-0 flex-1", className)} />;
}

export const Card = Object.assign(CardRoot, {
  Content: CardContent,
});
