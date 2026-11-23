import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";

const inputStyles = cva(
  "rounded-lg bg-transparent focus-visible:outline-2 focus-visible:outline-ui-keyboard",
);

export function Input({
  type = "text",
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      {...props}
      type={type}
      className={cn(inputStyles(), className)}
    />
  );
}
