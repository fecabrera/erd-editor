import type { ComponentProps } from "react";
import { cn } from "./cn";

const dialogStyle =
  "m-auto max-h-[calc(100dvh-24px)] w-[min(420px,calc(100%-24px))] rounded-[14px] border border-ui-line bg-ui-surface p-0 text-ui-ink shadow-[0_16px_48px_rgba(0,0,0,0.24)] backdrop:bg-[#0e16237a]";

export function Dialog({ className, ...props }: ComponentProps<"dialog">) {
  return <dialog {...props} className={cn(dialogStyle, className)} />;
}
