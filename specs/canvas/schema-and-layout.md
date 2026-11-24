# Schema model and layout

## Scope

DBML Core parses the source. The app uses its DBML-only parser and database
model to keep the SQL dialect parsers out of the browser bundle. Dagre
computes initial table positions. [Parser and layout implementation](../../src/schema.ts)

## Scene model

- Each table has a stable key formed from its schema and name. The default
  `public` schema is omitted from the displayed name. Other schemas remain
  qualified.
- Each field has a name, formatted type, and primary, required, foreign, and
  unique flags. Primary keys include column flags and primary indexes.
  Field badges use the explicit `not null` flag. The required flag covers
  both primary keys and explicit `not null` settings.
  Column-level uniqueness comes from an inline `unique` setting or a
  single-column unique index. Composite indexes constrain the combination
  of columns.
- References resolve to table and column IDs. Inline and stand-alone
  references feed the same relationship model. A one-to-one reference
  treats its second DBML endpoint as the foreign key.
- The scene includes the table dimensions and positions, relationship
  endpoints, and connector lanes. Composite references have one connector
  per reference. Each connector anchors to the first matching field in
  table order.

## Layout and routing

- Dagre uses a left-to-right multigraph, with 126 px between ranks, 58 px
  between nodes, and 30 px graph margins.
- Table height is a 40 px header plus 34 px per field. Width is at least
  208 px and expands to fit measured title and row content.
- A connector joins the relevant field rows. Parallel connectors spread
  across lanes. If a table blocks a lane, the connector routes around it
  with horizontal and vertical segments. Routes update when any table
  moves. Self-references loop outside their card.
- A dragged table keeps its position when reparsing yields the same table
  and field signature. If that signature changes, compute a new layout.
- Scene bounds include cards and connector paths. Fitting and exporting
  use these bounds with different padding.

## Acceptance criteria

- Resolve inline references across schemas and mark the correct foreign
  column for one-to-one references.
- Route connectors around unrelated tables, including after a table is dragged.
- Route self-references outside the card and include the loop in image
  bounds.
- Render the built-in example as five tables and four relationships.

[Parser and layout tests](../../test/schema.test.ts)
