import { Hand, MousePointer2, Redo2, Undo2 } from "lucide-react";
import { Button } from "./ui/button";
import { Group } from "./ui/group";

const toolButtonStyle =
  "relative grid size-8 place-items-center enabled:hover:bg-ui-hover aria-pressed:bg-ui-hover aria-pressed:text-ui-keyboard";

const shortcutStyle =
  "pointer-events-none absolute right-[3px] bottom-0.5 text-[8px]/none font-semibold";

export default function DiagramToolbar() {
  return (
    <Group
      id="diagram-toolbar"
      variant="floating"
      radius="xl"
      className="absolute top-[var(--workspace-inset)] left-1/2 z-[1] -translate-x-1/2 gap-1.25 p-1.25 max-[1040px]:top-[calc(var(--workspace-inset)+var(--floating-control-height)+8px)]"
      role="group"
      aria-label="Diagram tools"
    >
      <Button
        variant="plain"
        id="diagram-undo"
        className={toolButtonStyle}
        aria-label="Undo"
        title="Undo"
        disabled
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        variant="plain"
        id="diagram-redo"
        className={toolButtonStyle}
        aria-label="Redo"
        title="Redo"
        disabled
      >
        <Redo2 aria-hidden="true" />
      </Button>
      <div className="w-px shrink-0 self-stretch bg-ui-line" aria-hidden="true" />
      <Button
        variant="toggle"
        id="diagram-tool-pointer"
        className={toolButtonStyle}
        aria-label="Pointer"
        aria-keyshortcuts="V"
        aria-pressed="true"
        title="Pointer (V)"
      >
        <MousePointer2 aria-hidden="true" />
        <kbd className={shortcutStyle} aria-hidden="true">
          V
        </kbd>
      </Button>
      <Button
        variant="toggle"
        id="diagram-tool-hand"
        className={toolButtonStyle}
        aria-label="Hand"
        aria-keyshortcuts="M"
        aria-pressed="false"
        title="Hand (M)"
      >
        <Hand aria-hidden="true" />
        <kbd className={shortcutStyle} aria-hidden="true">
          M
        </kbd>
      </Button>
    </Group>
  );
}
