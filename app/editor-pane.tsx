import { Card } from "./ui/card";

export default function EditorPane() {
  return (
    <Card
      as="section"
      className="source absolute top-[calc(var(--workspace-inset)+var(--floating-control-height)+12px)] bottom-[var(--workspace-inset)] left-[var(--workspace-inset)] z-[2] w-[var(--editor-width)] shadow-[0_8px_24px_rgba(0,0,0,0.15)] max-[761px]:top-auto max-[761px]:h-[var(--editor-height)] max-[761px]:w-[calc(100%-2*var(--workspace-inset))]"
      id="editor-pane"
      aria-labelledby="source-heading"
    >
      <header className="panel-heading pane-bar border-b">
        <h2
          id="source-heading"
          className="text-ui-size/[1.4] font-bold tracking-[-0.018em]"
        >
          Editor
        </h2>
      </header>
      <Card.Content className="editor relative flex bg-ui-subtle focus-within:inset-ring-1 focus-within:inset-ring-ui-keyboard">
        <pre
          id="line-numbers"
          className="code-text w-[43px] flex-none overflow-hidden border-r border-ui-line py-3.5 pr-2 pl-0.5 text-right text-ui-numbers select-none"
          aria-hidden="true"
        ></pre>
        <div className="code-area relative min-w-0 flex-1">
          <pre
            id="highlight"
            className="code-text code-layer pointer-events-none overflow-hidden text-ui-code forced-colors:hidden"
            aria-hidden="true"
          ></pre>
          <textarea
            id="dbml"
            className="code-text code-layer resize-none overflow-auto bg-transparent text-transparent caret-ui-ink outline-none selection:bg-[#5e97da47] forced-colors:text-[CanvasText]"
            aria-label="DBML source"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            wrap="off"
          ></textarea>
        </div>
      </Card.Content>
      <p
        id="syntax-error"
        className="syntax-error max-h-[110px] overflow-auto border-t border-ui-line bg-ui-error-bg px-[15px] py-2.5 text-ui-size/[normal] text-ui-error"
        hidden
      ></p>
      <div className="editor-footer pane-bar border-t text-ui-size/[normal] text-ui-muted">
        <span
          id="schema-status"
          className="group inline-flex items-center gap-2"
          role="status"
        >
          <span className="status-dot size-[7px] shrink-0 rounded-full bg-ui-good group-data-[invalid]:bg-ui-error"></span>
          <span id="schema-status-text">Loading schema</span>
        </span>
        <span id="line-count">0 lines</span>
      </div>
    </Card>
  );
}
