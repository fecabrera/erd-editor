import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";
import { isMacPlatform } from "../../src/keyboard-shortcuts";
import type { PrimaryShortcut } from "../../src/keyboard-shortcuts";
import { Button } from "./button";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const menuStyles = cva("menu-surface", {
  variants: { radius: radiusVariants },
  defaultVariants: { radius: defaultRadius },
});
const menuItemStyles = cva("menu-item");
const menuItemShortcutStyles = cva(
  "ms-auto whitespace-nowrap text-ui-muted [font:inherit]",
);
const menuSeparatorStyles = cva("my-1.5 h-px bg-ui-line");

const subscribeToPlatform = () => () => {};

function useMacPlatform() {
  return useSyncExternalStore(subscribeToPlatform, isMacPlatform, () => false);
}

type MenuProps = ComponentProps<"div"> & VariantProps<typeof menuStyles>;

export function Menu({ className, radius, ...props }: MenuProps) {
  return <div {...props} className={cn(menuStyles({ radius }), className)} />;
}

type MenuItemProps = Omit<ComponentProps<typeof Button>, "variant"> & {
  shortcut?: PrimaryShortcut;
};

function MenuItemButton({
  children,
  className,
  radius,
  shortcut,
  ...props
}: MenuItemProps) {
  const isMac = useMacPlatform();
  const shortcutKeys = shortcut
    ? `${shortcut.shift ? "Shift+" : ""}${isMac ? "Meta" : "Control"}+${shortcut.key}`
    : props["aria-keyshortcuts"];

  return (
    <Button
      {...props}
      variant="plain"
      radius={radius}
      className={cn(menuItemStyles(), className)}
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
      className={cn(menuItemShortcutStyles(), className)}
    >
      {label}
    </kbd>
  );
}

export const MenuItem = Object.assign(MenuItemButton, {
  Shortcut: MenuItemShortcut,
});

export function MenuSeparator() {
  return <div className={menuSeparatorStyles()} aria-hidden="true" />;
}
