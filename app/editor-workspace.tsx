"use client";

import { useEffect } from "react";
import {
  Menu,
  ImageDown,
  Sun,
  Moon,
  Monitor,
  Download,
  Plus,
  Minus,
  Maximize,
} from "lucide-react";
import { mountEditor } from "../src/editor-controller";

export default function EditorWorkspace() {
  useEffect(mountEditor, []);

  return (
    <>
      <header
        className="floating-toolbar fixed top-[var(--workspace-inset)] left-[var(--workspace-inset)] z-[4] w-max"
        id="workspace-menu"
      >
        <h1 className="sr-only">Schema Studio</h1>
        <button
          className="menu-trigger app-button grid size-[var(--floating-control-height)] min-h-0 place-items-center rounded-[11px] px-0 shadow-[0_3px_10px_rgba(19,40,62,0.14)] aria-expanded:bg-ui-hover aria-expanded:text-ui-keyboard max-[421px]:px-0"
          id="toggle-menu"
          type="button"
          aria-label="Workspace menu"
          aria-expanded="false"
          aria-controls="menu-panel"
        >
          <Menu aria-hidden="true" />
        </button>
        <div
          className="menu-panel absolute top-[calc(100%+8px)] left-0 w-[min(240px,calc(100vw-48px))] rounded-xl border border-ui-line bg-ui-surface p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
          id="menu-panel"
          hidden
        >
          <button
            className="menu-action flex h-8 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-start text-ui-size/[normal] font-[650] enabled:hover:bg-ui-hover"
            id="open-export"
            type="button"
            aria-haspopup="dialog"
            disabled
          >
            <ImageDown aria-hidden="true" /> Export image
          </button>
          <div className="my-1.5 h-px bg-ui-line" aria-hidden="true"></div>
          <div className="menu-theme flex h-8 items-center justify-between gap-3 px-2.5 text-ui-size/[normal] font-[650]">
            <span>Theme</span>
            <div
              className="theme-picker flex flex-none gap-[3px]"
              role="group"
              aria-label="Color theme"
            >
              <button
                className="swatch-control aria-pressed:bg-[#f4f7fb] aria-pressed:text-[#375a7c]"
                data-theme-choice="light"
                aria-label="Light theme"
                title="Light theme"
                aria-pressed="false"
              >
                <Sun aria-hidden="true" />
              </button>
              <button
                className="swatch-control aria-pressed:bg-[#3f4350] aria-pressed:text-[#e3e7f0]"
                data-theme-choice="dark"
                aria-label="Dark theme"
                title="Dark theme"
                aria-pressed="false"
              >
                <Moon aria-hidden="true" />
              </button>
              <button
                className="swatch-control aria-pressed:bg-ui-hover aria-pressed:text-ui-ink"
                data-theme-choice="system"
                aria-label="Follow system theme"
                title="Follow system theme"
                aria-pressed="true"
              >
                <Monitor aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="workspace relative h-dvh overflow-hidden">
        <section
          className="source pane absolute top-[calc(var(--workspace-inset)+var(--floating-control-height)+12px)] bottom-[var(--workspace-inset)] left-[var(--workspace-inset)] z-[2] w-[var(--editor-width)] rounded-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] max-[761px]:top-auto max-[761px]:h-[var(--editor-height)] max-[761px]:w-[calc(100%-2*var(--workspace-inset))]"
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
          <div className="editor relative flex min-h-0 flex-1 bg-ui-subtle focus-within:inset-ring-1 focus-within:inset-ring-ui-keyboard">
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
          </div>
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
        </section>

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
            <div
              id="diagram-navigation"
              className="navigation absolute right-[var(--workspace-inset)] bottom-[var(--workspace-inset)] h-[var(--floating-control-height)] max-[761px]:bottom-[calc(var(--editor-height)+var(--workspace-inset)+12px)] flex items-stretch rounded-lg border border-ui-line bg-ui-surface shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
              aria-label="Diagram view controls"
            >
              <button
                id="zoom-out"
                className="zoom-control enabled:hover:bg-ui-hover"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <Minus aria-hidden="true" />
              </button>
              <form
                id="zoom-form"
                className="flex min-w-16 items-center justify-center gap-0.5 px-1.5 text-ui-size/[normal] text-ui-muted tabular-nums"
              >
                <input
                  id="zoom-level"
                  className="w-9 rounded bg-transparent text-right focus-visible:outline-2 focus-visible:outline-ui-keyboard"
                  type="text"
                  inputMode="decimal"
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Zoom percentage"
                  defaultValue="100"
                />
                <span aria-hidden="true">%</span>
              </form>
              <button
                id="zoom-in"
                className="zoom-control enabled:hover:bg-ui-hover"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <Plus aria-hidden="true" />
              </button>
              <button
                id="fit"
                className="zoom-control border-l border-ui-line px-[13px] enabled:hover:bg-ui-hover"
                aria-label="Fit diagram"
                title="Fit diagram"
              >
                <Maximize aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            id="diagram-info"
            className="pointer-events-none absolute top-[var(--workspace-inset)] right-[var(--workspace-inset)] flex h-[var(--floating-control-height)] items-center gap-3 rounded-lg border border-ui-line bg-ui-surface px-3 py-1.5 text-ui-size/[normal] text-ui-muted shadow-sm"
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
        </section>
      </main>
      <dialog
        id="export-dialog"
        className="export-dialog m-auto max-h-[calc(100dvh-24px)] w-[min(420px,calc(100%-24px))] rounded-[14px] border border-ui-line bg-ui-surface p-0 text-ui-ink shadow-[0_16px_48px_rgba(0,0,0,0.24)] backdrop:bg-[#0e16237a]"
        aria-labelledby="export-title"
      >
        <form id="export-form">
          <header className="export-heading px-5 pt-5 pb-4">
            <h2 id="export-title" className="text-ui-size/[normal] font-bold">
              Export diagram
            </h2>
            <p className="mt-1.5 text-ui-size/[1.45] text-ui-muted">
              Download the full diagram as an image.
            </p>
          </header>
          <div className="export-fields grid gap-4 px-5 pb-5">
            <fieldset className="export-field min-w-0">
              <legend className="mb-2 text-ui-size/[normal] font-[650]">
                Format
              </legend>
              <div className="export-choices grid grid-cols-2 gap-2">
                <label className="export-choice [&_input]:flex-none [&_input]:accent-ui-keyboard">
                  <input
                    type="radio"
                    name="format"
                    value="png"
                    defaultChecked
                    autoFocus
                  />
                  PNG
                </label>
                <label className="export-choice [&_input]:flex-none [&_input]:accent-ui-keyboard">
                  <input type="radio" name="format" value="jpg" /> JPG
                </label>
              </div>
            </fieldset>
            <fieldset
              className="export-field min-w-0"
              aria-describedby="background-hint"
            >
              <legend className="mb-2 text-ui-size/[normal] font-[650]">
                Background
              </legend>
              <div className="export-choices grid grid-cols-2 gap-2">
                <label className="export-choice [&_input]:flex-none [&_input]:accent-ui-keyboard">
                  <input
                    id="theme-background"
                    type="radio"
                    name="background"
                    value="theme"
                    defaultChecked
                  />
                  Theme color
                </label>
                <label className="export-choice [&_input]:flex-none [&_input]:accent-ui-keyboard">
                  <input
                    id="transparent-background"
                    type="radio"
                    name="background"
                    value="transparent"
                  />
                  Transparent
                </label>
              </div>
              <p
                id="background-hint"
                className="mt-1.5 text-ui-size/[1.45] text-ui-muted"
                hidden
              >
                JPG requires a solid background.
              </p>
            </fieldset>
          </div>
          <footer className="export-footer flex justify-end gap-2 border-t border-ui-line bg-ui-subtle px-5 py-3">
            <button
              className="app-button min-h-8"
              id="cancel-export"
              type="button"
            >
              Cancel
            </button>
            <button
              className="app-button primary-button min-h-8"
              id="download-export"
              type="submit"
            >
              <Download aria-hidden="true" /> Download
            </button>
          </footer>
        </form>
      </dialog>
      <div
        className="toast fixed bottom-4 left-1/2 z-[2] max-w-[calc(100%-24px)] -translate-x-1/2 rounded-lg border border-ui-line bg-ui-surface px-[15px] py-[11px] text-ui-size/[normal] text-ui-ink shadow-[0_4px_18px_rgba(0,0,0,0.16)]"
        id="toast"
        role="status"
        hidden
      ></div>
    </>
  );
}
