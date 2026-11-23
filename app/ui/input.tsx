import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Input({
  type = "text",
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      {...props}
      type={type}
      className={cn(
        "rounded bg-transparent focus-visible:outline-2 focus-visible:outline-ui-keyboard",
        className,
      )}
    />
  );
}
