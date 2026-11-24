import KeyBadge from "./key-badge";
import { Group } from "./ui/group";

export default function DiagramInfo() {
  return (
    <Group
      id="diagram-info"
      variant="floating"
      className="pointer-events-none absolute bottom-[var(--diagram-info-bottom)] left-1/2 h-[var(--floating-control-height)] -translate-x-1/2 items-center gap-3 px-3 py-1.5 whitespace-nowrap min-[761px]:max-[1280px]:left-[calc(50%+(var(--editor-width)+var(--workspace-inset))/2)]"
    >
      <p id="diagram-summary">No tables</p>
      <div
        className="legend flex items-center gap-3.5 border-l border-ui-line pl-3 max-[761px]:hidden [&>span]:flex [&>span]:items-center [&>span]:gap-1.5"
        aria-label="Diagram legend"
      >
        <span>
          <KeyBadge primary /> <span className="max-[900px]:sr-only">Primary key</span>
        </span>
        <span>
          <KeyBadge foreign /> <span className="max-[900px]:sr-only">Foreign key</span>
        </span>
        <span>
          <KeyBadge unique /> <span className="max-[900px]:sr-only">Unique</span>
        </span>
        <span>
          <KeyBadge notNull /> <span className="max-[900px]:sr-only">Not null</span>
        </span>
      </div>
    </Group>
  );
}
