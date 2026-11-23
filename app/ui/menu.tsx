import type { ComponentProps } from "react";
import { Button } from "./button";
import { cn } from "./cn";

export function Menu({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("menu-surface", className)} />;
}

export function MenuItem({ className, ...props }: ComponentProps<"button">) {
  return (
    <Button
      {...props}
      variant="plain"
      className={cn("menu-item", className)}
    />
  );
}

export function MenuSeparator() {
  return <div className="my-1.5 h-px bg-ui-line" aria-hidden="true" />;
}
