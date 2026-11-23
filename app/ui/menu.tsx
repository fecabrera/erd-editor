import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";
import { isMacPlatform } from "../../src/keyboard-shortcuts";
import type { PrimaryShortcut } from "../../src/keyboard-shortcuts";
import { Button } from "./button";
import { cn } from "./cn";

const subscribeToPlatform = () => () => {};

function useMacPlatform() {
  return useSyncExternalStore(subscribeToPlatform, isMacPlatform, () => false);
}

export function Menu({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("menu-surface", className)} />;
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
      className={cn("menu-item", className)}
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
      className={cn(
        "ms-auto whitespace-nowrap text-ui-muted [font:inherit]",
        className,
      )}
    >
      {label}
    </kbd>
  );
}

export const MenuItem = Object.assign(MenuItemButton, {
  Shortcut: MenuItemShortcut,
});

export function MenuSeparator() {
  return <div className="my-1.5 h-px bg-ui-line" aria-hidden="true" />;
}
