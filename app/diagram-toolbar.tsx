import { Hand, MousePointer2 } from "lucide-react";
import { Button } from "./ui/button";
import { Group } from "./ui/group";

const toolButtonStyle =
  "relative grid size-8 place-items-center rounded-[7px] enabled:hover:bg-ui-hover aria-pressed:bg-ui-hover aria-pressed:text-ui-keyboard aria-pressed:inset-ring-1 aria-pressed:inset-ring-ui-keyboard";

const shortcutStyle =
  "pointer-events-none absolute right-[3px] bottom-0.5 text-[8px]/none font-semibold";

export default function DiagramToolbar() {
  return (
    <Group
      id="diagram-toolbar"
      className="floating-surface absolute top-[var(--workspace-inset)] left-1/2 z-[1] -translate-x-1/2 gap-1 p-1 max-[940px]:top-[calc(var(--workspace-inset)+var(--floating-control-height)+8px)]"
      role="group"
      aria-label="Diagram tools"
    >
      <Button
        variant="plain"
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
        variant="plain"
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
