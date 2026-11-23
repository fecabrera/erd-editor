import { Download } from "lucide-react";
import { Button } from "./ui/button";
import { Choice } from "./ui/choice";
import { Dialog } from "./ui/dialog";
import { Group } from "./ui/group";

export default function ExportDialog() {
  return (
    <Dialog
      id="export-dialog"
      className="export-dialog"
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
            <Group layout="grid" className="export-choices grid-cols-2 gap-2">
              <Choice name="format" value="png" defaultChecked autoFocus>
                PNG
              </Choice>
              <Choice name="format" value="jpg">
                JPG
              </Choice>
            </Group>
          </fieldset>
          <fieldset
            className="export-field min-w-0"
            aria-describedby="background-hint"
          >
            <legend className="mb-2 text-ui-size/[normal] font-[650]">
              Background
            </legend>
            <Group layout="grid" className="export-choices grid-cols-2 gap-2">
              <Choice
                id="theme-background"
                name="background"
                value="theme"
                defaultChecked
              >
                Theme color
              </Choice>
              <Choice
                id="transparent-background"
                name="background"
                value="transparent"
              >
                Transparent
              </Choice>
            </Group>
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
          <Button
            className="min-h-8"
            id="cancel-export"
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="min-h-8"
            id="download-export"
            type="submit"
          >
            <Download aria-hidden="true" /> Download
          </Button>
        </footer>
      </form>
    </Dialog>
  );
}
