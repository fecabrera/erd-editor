# DBML editor

## Scope

The editor accepts DBML through a native, multiline textarea. Typing and
pasting update the preview and editor state locally. [Editor markup](../../app/editor-workspace.tsx) · [Editor logic](../../src/editor-controller.ts)

## Source views

DBML is the default view. Choose Tree in the diagram toolbar to browse
tables and expand each one to see its field names, data types, and
nullability. As on the diagram, PK and FK sit beside the field name, and UQ
and NN sit to the right of the type. Only fields explicitly marked
`not null` show **NN**. The tree
updates after a successful parse and keeps the last valid schema during
syntax errors.
Switching views preserves the draft, the textarea, open tree branches, and
the diagram view.

Click a table name in Tree view to select the table in both the tree and
the diagram. Shift-click adds an unselected table or removes a selected table.
Click the chevron to expand or collapse its field list. The
tree also highlights tables selected on the canvas, including group
selections. Escape clears the selection in both views.

Hovering a tree field highlights its row and shows the same diagram
highlight as hovering that field on its card, including related rows and
connectors. Hovering a diagram field also highlights its matching tree row.
Hovering a table name in the tree or its header on the diagram highlights
the table in both views. Hovering a diagram relationship highlights its
connected fields in the tree. Collapsed tables stay collapsed.

Click a field row in either view to select it in both. Clicking it on the
diagram also opens its table in the tree. The tree outline spans the full
row, and the diagram keeps the field and its relationships
highlighted after the pointer leaves. Field selection is independent of
table selection. Escape or clicking open canvas clears it.
Clicking a diagram relationship selects its endpoint fields and opens both
tables in the tree. The chevrons can still collapse either table. Clicking
the relationship again reopens them.

## Input and highlighting

- A fresh session starts with the built-in five-table, four-relationship
  store schema. If local storage contains source, restore it verbatim,
  including an empty or invalid draft. [Example schema](../../src/example.ts)
- The textarea stays above a read-only syntax layer and beside a line number
  gutter. All three use the same monospace size and line spacing. The syntax
  layer follows horizontal and vertical scrolling. The gutter follows
  vertical scrolling.
- The highlighter recognizes comments, strings, selected DBML keywords,
  and common field types. It creates text nodes and spans. The screen
  reader reads the textarea. In forced-colors mode, the native textarea
  text is visible and the syntax layer is hidden.
- Update highlighting, line numbers, and the saved draft on input. Debounce
  parsing for 180 ms. Disable export while the parse is pending. The line
  count includes an empty line after a trailing newline.

## Preview state

| Input or state | Editor feedback | Preview | Export |
| --- | --- | --- | --- |
| Valid DBML with tables | **Valid schema** | Render the current diagram and counts | Enabled |
| Blank or valid DBML with no tables | **No tables yet** | Clear the diagram and display the empty state | Disabled |
| Parse or layout error | **DBML needs attention** and a diagnostic | Retain the last valid scene, when available | Disabled |

For errors, display the first parser diagnostic and include a line number
when supplied. Link the diagnostic to the textarea with `aria-describedby`
and set `aria-invalid`. Clear both attributes on a successful parse.
[Parsing and schema model](../canvas/schema-and-layout.md)

## Acceptance criteria

- Pasting a valid schema updates the diagram, counts, and export availability
  after the debounce interval.
- Clearing the source clears the diagram and remains empty after reload.
- Invalid source stays editable. Correcting it replaces the last valid
  diagram and clears the diagnostic.
