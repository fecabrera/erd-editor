import type { ComponentProps, ComponentType, ReactNode } from "react";
import { Button } from "./button";

type PanelProps = ComponentProps<"div">;

type DropdownProps = {
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
  children,
}: DropdownProps) {
  return (
    <>
      <Button {...trigger} aria-expanded={open} aria-controls={id} />
      <Panel {...panelProps} id={id} hidden={!open}>
        {children}
      </Panel>
    </>
  );
}
