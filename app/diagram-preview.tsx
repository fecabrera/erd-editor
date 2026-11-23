import DiagramInfo from "./diagram-info";
import ZoomControls from "./zoom-controls";

export default function DiagramPreview() {
  return (
    <section
      className="preview absolute inset-0"
      aria-labelledby="preview-heading"
    >
      <h2 id="preview-heading" className="sr-only">
        Diagram preview
      </h2>
      <div
        id="viewport"
        className="viewport absolute inset-0 overflow-hidden bg-ui-canvas"
      >
        <canvas
          id="diagram"
          className="block size-full cursor-grab touch-none [&.dragging]:cursor-grabbing focus-visible:outline-offset-[-3px]"
          tabIndex={0}
          role="img"
          aria-label="Schema diagram. Use arrow keys to pan and plus or minus to zoom."
        ></canvas>
        <div
          id="empty"
          className="empty pointer-events-none absolute inset-y-0 right-0 left-[calc(var(--editor-width)+var(--workspace-inset))] flex flex-col max-[761px]:bottom-[calc(var(--editor-height)+var(--workspace-inset)+48px)] max-[761px]:left-0 items-center justify-center gap-[7px] text-ui-size/[normal] text-ui-muted"
          hidden
        >
          <strong className="text-ui-size/[normal] text-ui-ink">
            No tables to preview
          </strong>
          <span>Paste a DBML schema in the editor.</span>
        </div>
        <ZoomControls />
      </div>
      <DiagramInfo />
    </section>
  );
}
