import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

type ChoiceProps = Omit<
  ComponentProps<"input">,
  "type" | "children" | "dangerouslySetInnerHTML"
> & {
  children: ReactNode;
};

export function Choice({ children, className, ...inputProps }: ChoiceProps) {
  return (
    <label className={cn("choice-control", className)}>
      <input {...inputProps} type="radio" />
      {children}
    </label>
  );
}
