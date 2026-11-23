import type { ComponentProps } from "react";
import { Button } from "./button";
import { cn } from "./cn";

export function Menu({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("menu-surface", className)} />;
}

function MenuItemButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <Button
      {...props}
      variant="plain"
      className={cn("menu-item", className)}
    />
  );
}

function MenuItemShortcut({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      {...props}
      aria-hidden="true"
      className={cn(
        "ms-auto whitespace-nowrap text-ui-muted [font:inherit]",
        className,
      )}
    />
  );
}

export const MenuItem = Object.assign(MenuItemButton, {
  Shortcut: MenuItemShortcut,
});

export function MenuSeparator() {
  return <div className="my-1.5 h-px bg-ui-line" aria-hidden="true" />;
}
