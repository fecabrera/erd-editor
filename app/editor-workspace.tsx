"use client";

import { useEffect, useState } from "react";
import { mountEditor } from "../src/editor-controller";
import type { Schema } from "../src/schema";
import DiagramPreview from "./diagram-preview";
import EditorPane from "./editor-pane";
import type { SourceView } from "./editor-pane";
import ExportDialog from "./export-dialog";
import { Toast } from "./ui/toast";
import WorkspaceMenu from "./workspace-menu";

export default function EditorWorkspace() {
  const [sourceView, setSourceView] = useState<SourceView>("dbml");
  const [tables, setTables] = useState<Schema["tables"]>([]);
  useEffect(() => mountEditor(setTables), []);

  return (
    <>
      <WorkspaceMenu />

      <main className="workspace relative h-dvh overflow-hidden">
        <EditorPane view={sourceView} tables={tables} />
        <DiagramPreview sourceView={sourceView} onSourceViewChange={setSourceView} />
      </main>
      <ExportDialog />
      <Toast id="toast" hidden />
    </>
  );
}
