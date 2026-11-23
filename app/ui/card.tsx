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

function CardHeader({ className, ...props }: ComponentProps<"header">) {
  return <header {...props} className={cn("pane-bar border-b", className)} />;
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("min-h-0 flex-1", className)} />;
}

function CardFooter({ className, ...props }: ComponentProps<"footer">) {
  return <footer {...props} className={cn("pane-bar border-t", className)} />;
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});
