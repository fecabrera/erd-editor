import { Table2 } from "lucide-react";
import type { Schema } from "../src/schema";
import KeyBadge from "./key-badge";
import { Card } from "./ui/card";
import { Tree } from "./ui/tree";

export default function SchemaTree({
  tables,
  hidden,
}: {
  tables: Schema["tables"];
  hidden: boolean;
}) {
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
                    <Tree.Item key={field.name}>
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
