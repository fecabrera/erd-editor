import { Plus, Minus, Maximize } from "lucide-react";
import { Button } from "./ui/button";
import { Group } from "./ui/group";
import { Input } from "./ui/input";

export default function ZoomControls() {
  return (
    <Group
      id="diagram-navigation"
      variant="floating"
      className="navigation absolute right-[var(--workspace-inset)] bottom-[var(--workspace-inset)] h-[var(--floating-control-height)] max-[761px]:bottom-[calc(var(--editor-height)+var(--workspace-inset)+12px)] items-stretch"
      aria-label="Diagram view controls"
    >
      <Button
        variant="plain"
        id="zoom-out"
        className="zoom-control rounded-s-md enabled:hover:bg-ui-hover"
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
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus aria-hidden="true" />
      </Button>
      <Button
        variant="plain"
        id="fit"
        className="zoom-control rounded-e-md border-l border-ui-line enabled:hover:bg-ui-hover"
        aria-label="Fit diagram"
        title="Fit diagram"
      >
        <Maximize aria-hidden="true" />
      </Button>
    </Group>
  );
}
