import type { ComponentProps } from "react";
import { cn } from "./cn";

const toastStyle =
  "toast fixed bottom-4 left-1/2 z-[2] max-w-[calc(100%-24px)] -translate-x-1/2 rounded-lg border border-ui-line bg-ui-surface px-[15px] py-[11px] text-ui-size/[normal] text-ui-ink shadow-[0_4px_18px_rgba(0,0,0,0.16)]";

export function Toast({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(toastStyle, className)}
      role="status"
    />
  );
}
