"use client";

import { useEffect, useRef, useState } from "react";
import type { DiagramHover } from "../src/draw";
import { mountEditor } from "../src/editor-controller";
import type { DiagramSelection, Schema } from "../src/schema";
import DiagramPreview from "./diagram-preview";
import EditorPane from "./editor-pane";
import type { SourceView } from "./editor-pane";
import ExportDialog from "./export-dialog";
import { Toast } from "./ui/toast";
import WorkspaceMenu from "./workspace-menu";

export default function EditorWorkspace() {
  const [sourceView, setSourceView] = useState<SourceView>("dbml");
  const [tables, setTables] = useState<Schema["tables"]>([]);
  const [hovered, setHovered] = useState<DiagramHover>();
  const [diagramSelection, setDiagramSelection] = useState<DiagramSelection>();
  const [selectedTableIds, setSelectedTableIds] = useState<ReadonlySet<string>>(() => new Set());
  const [openTableIds, setOpenTableIds] = useState<ReadonlySet<string>>(() => new Set());
  const controller = useRef<ReturnType<typeof mountEditor>>(undefined);
  useEffect(() => {
    const editor = mountEditor({
      onTablesChanged(nextTables) {
        setTables(nextTables);
        const ids = new Set(nextTables.map(({ id }) => id));
        setOpenTableIds((current) => {
          const remaining = [...current].filter((id) => ids.has(id));
          return remaining.length === current.size ? current : new Set(remaining);
        });
      },
      onSelectionChanged: setSelectedTableIds,
      onHoverChanged: setHovered,
      onDiagramSelectionChanged: setDiagramSelection,
      onRevealTables(ids) {
        setOpenTableIds((current) =>
          ids.every((id) => current.has(id))
            ? current
            : new Set([...current, ...ids]),
        );
      },
    });
    controller.current = editor;
    return () => {
      controller.current = undefined;
      editor?.dispose();
    };
  }, []);

  return (
    <>
      <WorkspaceMenu />

      <main className="workspace relative h-dvh overflow-hidden">
        <EditorPane
          view={sourceView}
          tables={tables}
          selectedTableIds={selectedTableIds}
          openTableIds={openTableIds}
          onTableOpenChange={(id, open) => {
            setOpenTableIds((current) => {
              const next = new Set(current);
              if (open) next.add(id);
              else next.delete(id);
              return next;
            });
          }}
          diagramSelection={diagramSelection}
          onFieldSelect={(field) => controller.current?.selectField(field)}
          hovered={hovered}
          onTableSelect={(id, toggle) => controller.current?.selectTable(id, toggle)}
          onTreeHover={(target) => controller.current?.setTreeHover(target)}
        />
        <DiagramPreview
          sourceView={sourceView}
          onSourceViewChange={(view) => {
            if (view === "dbml") controller.current?.setTreeHover();
            setSourceView(view);
          }}
        />
      </main>
      <ExportDialog />
      <Toast id="toast" hidden />
    </>
  );
}
