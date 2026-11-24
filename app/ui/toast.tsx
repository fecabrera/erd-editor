import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const toastStyles = cva(
  "toast fixed bottom-4 left-1/2 z-[2] max-w-[calc(100%-24px)] -translate-x-1/2 border border-ui-line bg-ui-surface px-[15px] py-[11px] text-ui-size/[normal] text-ui-ink shadow-[0_4px_18px_rgba(0,0,0,0.16)]",
  {
    variants: { radius: radiusVariants },
    defaultVariants: { radius: defaultRadius },
  },
);

type ToastProps = ComponentProps<"div"> & VariantProps<typeof toastStyles>;

export function Toast({ className, radius, ...props }: ToastProps) {
  return (
    <div
      {...props}
      className={cn(toastStyles({ radius }), className)}
      role="status"
    />
  );
}
