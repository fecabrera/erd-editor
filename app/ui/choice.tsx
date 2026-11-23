import { cva } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

const choiceStyles = cva("choice-control rounded-lg");

type ChoiceProps = Omit<
  ComponentProps<"input">,
  "type" | "children" | "dangerouslySetInnerHTML"
> & {
  children: ReactNode;
};

export function Choice({ children, className, ...inputProps }: ChoiceProps) {
  return (
    <label className={cn(choiceStyles(), className)}>
      <input {...inputProps} type="radio" />
      {children}
    </label>
  );
}
