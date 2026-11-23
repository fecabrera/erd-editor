import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";
import { isMacPlatform } from "../../src/keyboard-shortcuts";
import type { PrimaryShortcut } from "../../src/keyboard-shortcuts";
import { Button } from "./button";
import { cn } from "./cn";

const menuStyles = cva(null, {
  variants: {
    part: {
      panel: "menu-surface rounded-lg",
      item: "menu-item",
      shortcut: "ms-auto whitespace-nowrap text-ui-muted [font:inherit]",
      separator: "my-1.5 h-px bg-ui-line",
    },
  },
  defaultVariants: { part: "panel" },
});

const subscribeToPlatform = () => () => {};

function useMacPlatform() {
  return useSyncExternalStore(subscribeToPlatform, isMacPlatform, () => false);
}

export function Menu({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn(menuStyles(), className)} />;
}

type MenuItemProps = ComponentProps<"button"> & {
  shortcut?: PrimaryShortcut;
};

function MenuItemButton({ children, className, shortcut, ...props }: MenuItemProps) {
  const isMac = useMacPlatform();
  const shortcutKeys = shortcut
    ? `${shortcut.shift ? "Shift+" : ""}${isMac ? "Meta" : "Control"}+${shortcut.key}`
    : props["aria-keyshortcuts"];

  return (
    <Button
      {...props}
      variant="plain"
      radius="lg"
      className={cn(menuStyles({ part: "item" }), className)}
      aria-keyshortcuts={shortcutKeys}
    >
      {children}
      {shortcut && <MenuItemShortcut shortcut={shortcut} />}
    </Button>
  );
}

type MenuItemShortcutProps = ComponentProps<"kbd"> & {
  shortcut?: PrimaryShortcut;
};

function MenuItemShortcut({
  children,
  className,
  shortcut,
  ...props
}: MenuItemShortcutProps) {
  const isMac = useMacPlatform();
  let label = children;
  if (shortcut) {
    label = isMac
      ? `${shortcut.shift ? "⇧" : ""}⌘${shortcut.key}`
      : `${shortcut.shift ? "Shift+" : ""}Ctrl+${shortcut.key}`;
  }

  return (
    <kbd
      {...props}
      aria-hidden="true"
      className={cn(menuStyles({ part: "shortcut" }), className)}
    >
      {label}
    </kbd>
  );
}

export const MenuItem = Object.assign(MenuItemButton, {
  Shortcut: MenuItemShortcut,
});

export function MenuSeparator() {
  return <div className={menuStyles({ part: "separator" })} aria-hidden="true" />;
}
