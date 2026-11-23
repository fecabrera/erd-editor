import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";

const cardStyles = cva(null, {
  variants: {
    part: {
      root: "pane rounded-lg",
      header: "pane-bar border-b",
      content: "min-h-0 flex-1",
      footer: "pane-bar border-t",
    },
  },
  defaultVariants: { part: "root" },
});

type CardProps = ComponentProps<"div"> & {
  as?: "div" | "section" | "article";
};

function CardRoot({ as: Element = "div", className, ...props }: CardProps) {
  return (
    <Element
      {...props}
      className={cn(cardStyles(), className)}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header {...props} className={cn(cardStyles({ part: "header" }), className)} />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(cardStyles({ part: "content" }), className)} />
  );
}

function CardFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer {...props} className={cn(cardStyles({ part: "footer" }), className)} />
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});
