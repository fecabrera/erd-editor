"use client";

import { useEffect } from "react";
import { mountEditor } from "../src/editor-controller";
import DiagramPreview from "./diagram-preview";
import EditorPane from "./editor-pane";
import ExportDialog from "./export-dialog";
import { Toast } from "./ui/toast";
import WorkspaceMenu from "./workspace-menu";

export default function EditorWorkspace() {
  useEffect(mountEditor, []);

  return (
    <>
      <WorkspaceMenu />

      <main className="workspace relative h-dvh overflow-hidden">
        <EditorPane />
        <DiagramPreview />
      </main>
      <ExportDialog />
      <Toast id="toast" hidden />
    </>
  );
}
