import type { ComponentProps } from "react";
import { cn } from "./cn";

const variants = {
  standard: "app-button",
  primary: "app-button primary-button",
  toggle: "rounded-ui aria-pressed:inset-ring-1 aria-pressed:inset-ring-ui-keyboard",
  plain: "",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({
  variant = "standard",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(variants[variant], className)}
    />
  );
}
