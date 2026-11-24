import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const cardStyles = cva("pane", {
  variants: { radius: radiusVariants },
  defaultVariants: { radius: defaultRadius },
});

const cardHeaderStyles = cva("pane-bar border-b");
const cardContentStyles = cva("min-h-0 flex-1");
const cardFooterStyles = cva("pane-bar border-t");

type CardProps = ComponentProps<"div"> & {
  as?: "div" | "section" | "article";
} & VariantProps<typeof cardStyles>;

function CardRoot({ as: Element = "div", className, radius, ...props }: CardProps) {
  return (
    <Element
      {...props}
      className={cn(cardStyles({ radius }), className)}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header {...props} className={cn(cardHeaderStyles(), className)} />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={cn(cardContentStyles(), className)} />
  );
}

function CardFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer {...props} className={cn(cardFooterStyles(), className)} />
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});
