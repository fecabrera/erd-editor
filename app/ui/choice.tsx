import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { defaultRadius, radiusVariants } from "./radius";

const choiceStyles = cva("choice-control", {
  variants: { radius: radiusVariants },
  defaultVariants: { radius: defaultRadius },
});

type ChoiceProps = Omit<
  ComponentProps<"input">,
  "type" | "children" | "dangerouslySetInnerHTML"
> & VariantProps<typeof choiceStyles> & {
  children: ReactNode;
};

export function Choice({
  children,
  className,
  radius,
  ...inputProps
}: ChoiceProps) {
  return (
    <label className={cn(choiceStyles({ radius }), className)}>
      <input {...inputProps} type="radio" />
      {children}
    </label>
  );
}
