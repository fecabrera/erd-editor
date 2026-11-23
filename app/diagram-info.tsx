export default function DiagramInfo() {
  return (
    <div
      id="diagram-info"
      className="floating-surface pointer-events-none absolute top-[var(--workspace-inset)] right-[var(--workspace-inset)] flex h-[var(--floating-control-height)] items-center gap-3 px-3 py-1.5"
    >
      <p id="diagram-summary">No tables</p>
      <div
        className="legend flex border-l border-ui-line pl-3 max-[761px]:hidden items-center gap-3.5 [&_span]:flex [&_span]:items-center [&_span]:gap-1.5 [&_b]:rounded-sm [&_b]:bg-ui-hover [&_b]:px-1 [&_b]:py-[3px] [&_b]:font-mono [&_b]:text-ui-size/[normal] [&_b]:text-ui-legend-ink"
        aria-label="Diagram legend"
      >
        <span>
          <b className="pk">PK</b> Primary key
        </span>
        <span>
          <b className="fk">FK</b> Foreign key
        </span>
      </div>
    </div>
  );
}
