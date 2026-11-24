import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const inputStyles = cva(
  "bg-transparent focus-visible:outline-2 focus-visible:outline-ui-keyboard",
  {
    variants: { radius: radiusVariants },
    defaultVariants: { radius: defaultRadius },
  },
);

type InputProps = ComponentProps<"input"> & VariantProps<typeof inputStyles>;

export function Input({
  type = "text",
  className,
  radius,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      type={type}
      className={cn(inputStyles({ radius }), className)}
    />
  );
}
