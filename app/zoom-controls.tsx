import { Plus, Minus, Maximize } from "lucide-react";
import { Button } from "./ui/button";
import { Group } from "./ui/group";
import { Input } from "./ui/input";

export default function ZoomControls() {
  return (
    <Group
      id="diagram-navigation"
      variant="floating"
      className="navigation absolute right-[var(--workspace-inset)] bottom-[var(--diagram-navigation-bottom)] h-[var(--floating-control-height)] items-stretch"
      aria-label="Diagram view controls"
    >
      <Button
        variant="plain"
        id="zoom-out"
        className="zoom-control enabled:hover:bg-ui-hover"
        radius="none"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus aria-hidden="true" />
      </Button>
      <form
        id="zoom-form"
        className="flex min-w-16 items-center justify-center gap-0.5 px-1.5 tabular-nums"
      >
        <Input
          id="zoom-level"
          className="w-9 text-right"
          inputMode="decimal"
          spellCheck={false}
          autoComplete="off"
          aria-label="Zoom percentage"
          defaultValue="100"
        />
        <span aria-hidden="true">%</span>
      </form>
      <Button
        variant="plain"
        id="zoom-in"
        className="zoom-control enabled:hover:bg-ui-hover"
        radius="none"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus aria-hidden="true" />
      </Button>
      <div className="border-l border-ui-line" />
      <Button
        variant="plain"
        id="fit"
        className="zoom-control border-ui-line enabled:hover:bg-ui-hover"
        radius="none"
        aria-label="Fit diagram"
        title="Fit diagram"
      >
        <Maximize aria-hidden="true" />
      </Button>
    </Group>
  );
}
