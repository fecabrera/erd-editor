import { Table2 } from "lucide-react";
import { useRef } from "react";
import type { DiagramHover } from "../src/draw";
import { highlightConnections } from "../src/schema";
import type { DiagramSelection, Schema, TableTarget } from "../src/schema";
import KeyBadge from "./key-badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tree } from "./ui/tree";

export default function SchemaTree({
  tables,
  hidden,
  selectedTableIds,
  openTableIds,
  onTableOpenChange,
  diagramSelection,
  onFieldSelect,
  hovered,
  onTableSelect,
  onTreeHover,
}: {
  tables: Schema["tables"];
  hidden: boolean;
  selectedTableIds: ReadonlySet<string>;
  openTableIds: ReadonlySet<string>;
  onTableOpenChange: (id: string, open: boolean) => void;
  diagramSelection?: DiagramSelection;
  onFieldSelect: (field: Required<TableTarget>) => void;
  hovered?: DiagramHover;
  onTableSelect: (id: string, toggle: boolean) => void;
  onTreeHover: (target?: TableTarget) => void;
}) {
  const treeHover = useRef<TableTarget>(undefined);
  const hoveredTable = hovered?.table;
  const connectedFields = hovered?.connection
    ? highlightConnections([hovered.connection]).rows
    : undefined;
  const selectedField = diagramSelection?.kind === "field" ? diagramSelection.field : undefined;
  const selectedEndpoints = diagramSelection?.kind === "relationship"
    ? highlightConnections([diagramSelection.link]).rows
    : undefined;

  function startHover(target: TableTarget, pointerType: string) {
    if (pointerType === "touch") return;
    treeHover.current = target;
    onTreeHover(target);
  }

  function clearHover(tableId: string, fieldName?: string) {
    if (treeHover.current?.tableId !== tableId || treeHover.current.fieldName !== fieldName) return;
    treeHover.current = undefined;
    onTreeHover();
  }

  return (
    <Card.Content
      id="schema-tree"
      className="overflow-auto bg-ui-subtle p-1.5"
      hidden={hidden}
    >
      {tables.length ? (
        <Tree>
          {tables.map((table) => (
            <Tree.Branch
              key={table.id}
              open={openTableIds.has(table.id)}
              selected={selectedTableIds.has(table.id)}
              highlighted={hoveredTable?.tableId === table.id && hoveredTable.fieldName === undefined}
              labelPointerEvents={{
                onPointerEnter: (event) => startHover({ tableId: table.id }, event.pointerType),
                onPointerLeave: () => clearHover(table.id),
              }}
              onSelect={(event) => onTableSelect(table.id, event.shiftKey)}
              onOpenChange={(open) => {
                const fieldName = treeHover.current?.fieldName;
                if (!open && fieldName !== undefined) clearHover(table.id, fieldName);
                onTableOpenChange(table.id, open);
              }}
              toggleLabel={`Toggle fields for ${table.name}`}
              label={
                <>
                  <Table2 aria-hidden="true" className="text-ui-muted" />
                  <span className="truncate" title={table.name}>
                    {table.name}
                  </span>
                </>
              }
            >
              {table.fields.length ? (
                <Tree.Group>
                  {table.fields.map((field) => (
                    <Tree.Item
                      key={field.name}
                      className="rounded-sm px-0 hover:bg-ui-hover data-[highlighted=true]:bg-ui-hover"
                      data-highlighted={
                        (hoveredTable?.tableId === table.id && hoveredTable.fieldName === field.name) ||
                        connectedFields?.get(table.id)?.has(field.name) === true
                      }
                      onPointerEnter={(event) =>
                        startHover({ tableId: table.id, fieldName: field.name }, event.pointerType)
                      }
                      onPointerLeave={() => clearHover(table.id, field.name)}
                    >
                      <Button
                        variant="toggle"
                        radius="sm"
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 self-stretch px-1.5 text-start aria-pressed:bg-ui-hover focus-visible:outline-2 focus-visible:outline-ui-keyboard"
                        aria-pressed={
                          (selectedField?.tableId === table.id && selectedField.fieldName === field.name) ||
                          selectedEndpoints?.get(table.id)?.has(field.name) === true
                        }
                        onClick={() => onFieldSelect({ tableId: table.id, fieldName: field.name })}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="truncate" title={field.name}>
                            {field.name}
                          </span>
                          <KeyBadge primary={field.primary} foreign={field.foreign} />
                        </span>
                        <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
                          <span className="truncate font-editor text-ui-muted" title={field.type}>
                            {field.type}
                          </span>
                          <KeyBadge unique={field.unique} notNull={field.notNull} />
                        </span>
                      </Button>
                    </Tree.Item>
                  ))}
                </Tree.Group>
              ) : (
                <p className="ms-7 py-1 text-ui-muted">No fields</p>
              )}
            </Tree.Branch>
          ))}
        </Tree>
      ) : (
        <p className="px-1.5 py-2 text-ui-muted">No tables</p>
      )}
    </Card.Content>
  );
}
