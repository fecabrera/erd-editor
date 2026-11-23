import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { Button } from "./button";
import { cn } from "./cn";

const dropdownPanelStyles = cva(null, {
  variants: {
    placement: {
      inline: null,
      "below-start": "absolute top-[calc(100%+8px)] left-0",
    },
  },
  defaultVariants: { placement: "inline" },
});

type PanelProps = ComponentProps<"div">;

type DropdownProps = VariantProps<typeof dropdownPanelStyles> & {
  id: string;
  open?: boolean;
  trigger: Omit<ComponentProps<typeof Button>, "aria-controls" | "aria-expanded">;
  panel?: "div" | ComponentType<PanelProps>;
  panelProps?: Omit<PanelProps, "children" | "hidden" | "id">;
  children: ReactNode;
};

export function Dropdown({
  id,
  open = false,
  trigger,
  panel: Panel = "div",
  panelProps,
  placement,
  children,
}: DropdownProps) {
  const className = cn(dropdownPanelStyles({ placement }), panelProps?.className);
  return (
    <>
      <Button {...trigger} aria-expanded={open} aria-controls={id} />
      <Panel
        {...panelProps}
        id={id}
        hidden={!open}
        className={className || undefined}
      >
        {children}
      </Panel>
    </>
  );
}
