import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const dialogStyles = cva(
  "m-auto max-h-[calc(100dvh-24px)] w-[min(420px,calc(100%-24px))] border border-ui-line bg-ui-surface p-0 text-ui-ink shadow-[0_16px_48px_rgba(0,0,0,0.24)] backdrop:bg-[#0e16237a]",
  {
    variants: { radius: radiusVariants },
    defaultVariants: { radius: defaultRadius },
  },
);

type DialogProps = ComponentProps<"dialog"> & VariantProps<typeof dialogStyles>;

export function Dialog({ className, radius, ...props }: DialogProps) {
  return <dialog {...props} className={cn(dialogStyles({ radius }), className)} />;
}
