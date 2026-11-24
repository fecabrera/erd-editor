import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const buttonStyles = cva(null, {
  variants: {
    variant: {
      standard: "app-button",
      primary: "app-button primary-button",
      toggle: "aria-pressed:inset-ring-1 aria-pressed:inset-ring-ui-keyboard",
      plain: null,
    },
    radius: radiusVariants,
  },
  defaultVariants: { variant: "standard", radius: defaultRadius },
});

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonStyles>;

export function Button({
  variant,
  radius,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(buttonStyles({ variant, radius }), className)}
    />
  );
}
