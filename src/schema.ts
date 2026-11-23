// Use DBML Core's DBML-only parser and model. Its top-level entry also bundles
// the SQL dialect parsers, which this app does not use.
import { require_dbmlParser } from "../node_modules/@dbml/core/lib/parse/deprecated/dbmlParser.mjs";
import Database from "../node_modules/@dbml/core/lib/model_structure/database.mjs";
import dagre from "@dagrejs/dagre";
import type { ColumnType } from "@dbml/core";
import { compactPath, routeAround, segmentClear } from "./connector-routing";

export interface Point {
  x: number;
  y: number;
}

interface ConnectorPoint extends Point {
  squareCorner?: boolean;
}

interface Field {
  name: string;
  type: string;
  primary: boolean;
  required: boolean;
  foreign: boolean;
}

interface Table {
  id: string;
  name: string;
  fields: Field[];
}

interface Endpoint {
  id: string;
  names: string[];
  many: boolean;
  optional: boolean;
}

interface SchemaLink {
  from: Endpoint;
  to: Endpoint;
}

interface Schema {
  tables: Table[];
  links: SchemaLink[];
}

export interface PositionedTable extends Table, Point {
  width: number;
  height: number;
  moved?: boolean;
}

export interface PositionedLink extends SchemaLink {
  lane: number;
}

interface Layout {
  tables: PositionedTable[];
  links: PositionedLink[];
}

export interface Scene extends Layout {
  byId: ReadonlyMap<string, PositionedTable>;
  signature?: string;
}

export interface TableTarget {
  tableId: string;
  fieldName?: string;
}

export function tableTargetAtPoint(
  tables: PositionedTable[],
  { x, y }: Point,
): TableTarget | undefined {
  const table = tables.findLast(
    (item) =>
      x >= item.x &&
      x < item.x + item.width &&
      y >= item.y &&
      y < item.y + item.height,
  );
  if (!table) return;
  const field = table.fields[Math.floor((y - table.y - HEADER) / ROW)];
  return { tableId: table.id, fieldName: field?.name };
}

export function tableIdsInRectangle(
  tables: PositionedTable[],
  start: Point,
  end: Point,
) {
  const left = Math.min(start.x, end.x);
  const right = Math.max(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const bottom = Math.max(start.y, end.y);
  return new Set(
    tables
      .filter(
        (table) =>
          table.x <= right &&
          table.x + table.width >= left &&
          table.y <= bottom &&
          table.y + table.height >= top,
      )
      .map((table) => table.id),
  );
}

export function highlightConnections(
  links: PositionedLink[],
  rows = new Map<string, Set<string>>(),
) {
  for (const link of links) {
    for (const { id, names } of [link.from, link.to]) {
      const fields = rows.get(id) ?? new Set<string>();
      for (const name of names) fields.add(name);
      rows.set(id, fields);
    }
  }
  return { rows, connections: new Set(links) };
}

export function highlightField(links: PositionedLink[], target: TableTarget) {
  const { tableId, fieldName } = target;
  if (fieldName === undefined) return;
  const directLinks = links.filter((link) =>
    [link.from, link.to].some(
      ({ id, names }) => id === tableId && names.includes(fieldName),
    ),
  );
  return highlightConnections(
    directLinks,
    new Map([[tableId, new Set([fieldName])]]),
  );
}

type Diagnostic = {
  message?: string;
  location?: { start?: { line?: number } };
  start?: { line?: number };
};

type ParserError = Diagnostic & { diags?: Diagnostic[] };

export const HEADER = 40;
export const ROW = 34;
const parser = require_dbmlParser();

export function parseSchema(source: string): Schema {
  if (!source.trim()) return { tables: [], links: [] };

  const { schemas } = new Database(parser.parse(source));
  const tables = schemas.flatMap((schema) =>
    schema.tables.map((table) => {
      const id = `${schema.name}.${table.name}`;
      const name = schema.name === "public" ? table.name : id;
      const primary = new Set<string>(
        table.indexes
          .filter((index) => index.pk)
          .flatMap((index) =>
            index.columns.map(({ value }) => value as string),
          ),
      );
      const fields = table.fields.map((field): Field => {
        // DBML Core's model includes parameters and schema qualification in type_name.
        const { type_name: type }: ColumnType = field.type;
        const isPrimary = Boolean(field.pk || primary.has(field.name));
        return {
          name: field.name,
          type,
          primary: isPrimary,
          required: Boolean(field.not_null || isPrimary),
          foreign: false,
        };
      });
      return { id, name, fields };
    }),
  );
  const byId = new Map(tables.map((table) => [table.id, table]));
  const links = schemas.flatMap(({ refs }) =>
    refs
      .map((ref) => {
        const ends = ref.endpoints.map((endpoint) => {
          const id = `${endpoint.schemaName || "public"}.${endpoint.tableName}`;
          const table = byId.get(id);
          const fields = (table?.fields ?? []).filter((field) =>
            endpoint.fieldNames.includes(field.name),
          );
          return {
            id,
            names: endpoint.fieldNames,
            fields,
            many: endpoint.relation === "*",
          };
        });
        if (ends.some(({ id, fields }) => !byId.has(id) || !fields.length))
          return null;
        const [from, to] = ends;
        // DBML normalizes many-to-one ordering to parent first. For a one-to-one
        // reference its second endpoint is the foreign key.
        const foreign = from.many && !to.many ? from : to;
        foreign.fields.forEach((field) => {
          field.foreign = true;
        });
        if (from.many && to.many)
          from.fields.forEach((field) => {
            field.foreign = true;
          });
        return {
          from: {
            ...from,
            optional:
              foreign === to && !to.fields.every((field) => field.required),
          },
          to: {
            ...to,
            optional: to.many || (foreign === to && !from.many && !to.many),
          },
        };
      })
      .filter((link) => link !== null),
  );

  return { tables, links };
}

export function describeError(error: unknown) {
  const parserError = error as ParserError | undefined;
  const diagnostic = parserError?.diags?.[0] ?? parserError;
  const line = diagnostic?.location?.start?.line ?? diagnostic?.start?.line;
  const message = diagnostic?.message ?? "Check the DBML syntax.";
  return `${line ? `Line ${line} · ` : ""}${message}`;
}

export function layoutSchema(
  schema: Schema,
  measure: (text: string, font: "title" | "field" | "type") => number,
): Layout {
  const graph = new dagre.graphlib.Graph({ multigraph: true });
  graph.setGraph({
    rankdir: "LR",
    ranksep: 126,
    nodesep: 58,
    marginx: 30,
    marginy: 30,
  });
  graph.setDefaultEdgeLabel(() => ({}));
  const tables = schema.tables.map((table): PositionedTable => {
    const width = Math.ceil(
      Math.max(
        208,
        measure(table.name, "title") + 60,
        ...table.fields.map(
          (field) =>
            measure(field.name, "field") + measure(field.type, "type") + 76,
        ),
      ),
    );
    const height = HEADER + table.fields.length * ROW;
    graph.setNode(table.id, { width, height });
    return { ...table, width, height, x: 0, y: 0 };
  });
  schema.links.forEach((link, index) => {
    graph.setEdge(link.from.id, link.to.id, {}, String(index));
  });
  dagre.layout(graph);
  for (const table of tables) {
    const point = graph.node(table.id);
    table.x = point.x - table.width / 2;
    table.y = point.y - table.height / 2;
  }
  const channels = new Map<string, PositionedLink[]>();
  const links = schema.links.map((link) => {
    const columns = [graph.node(link.from.id).x, graph.node(link.to.id).x];
    const channel = columns.sort((a, b) => a - b).join(":");
    const connection = { ...link, lane: 0.5 };
    const lane = channels.get(channel) ?? [];
    lane.push(connection);
    channels.set(channel, lane);
    return connection;
  });
  for (const channel of channels.values()) {
    if (channel.length < 2) continue;
    channel.forEach((link, index) => {
      link.lane = 0.3 + (0.4 * index) / (channel.length - 1);
    });
  }
  return { tables, links };
}

export function graphBounds(
  scene: Layout & { byId?: Scene["byId"] },
  padding = 40,
) {
  if (!scene.tables.length) return { x: 0, y: 0, width: 1, height: 1 };
  const tables =
    scene.byId ?? new Map(scene.tables.map((table) => [table.id, table]));
  const points = scene.links.flatMap((link) => routeLink(link, tables));
  const left = Math.min(
    ...scene.tables.map((table) => table.x),
    ...points.map((point) => point.x),
  );
  const top = Math.min(
    ...scene.tables.map((table) => table.y),
    ...points.map((point) => point.y),
  );
  const right = Math.max(
    ...scene.tables.map((table) => table.x + table.width),
    ...points.map((point) => point.x),
  );
  const bottom = Math.max(
    ...scene.tables.map((table) => table.y + table.height),
    ...points.map((point) => point.y),
  );
  return {
    x: left - padding,
    y: top - padding,
    width: right - left + padding * 2,
    height: bottom - top + padding * 2,
  };
}

export function routeLink(
  link: PositionedLink,
  tables: Scene["byId"],
): ConnectorPoint[] {
  const from = tables.get(link.from.id);
  const to = tables.get(link.to.id);
  if (!from || !to) return [];

  const fieldY = (table: PositionedTable, endpoint: Endpoint) =>
    table.y +
    HEADER +
    ROW *
      (Math.max(
        0,
        table.fields.findIndex((field) => endpoint.names.includes(field.name)),
      ) +
        0.5);
  const ay = fieldY(from, link.from);
  const by = fieldY(to, link.to);
  const right = from.x + from.width / 2 <= to.x + to.width / 2;
  const direction = from === to || right ? 1 : -1;
  const anchor = (table: PositionedTable, y: number, side: number) => ({
    x: table.x + (side === 1 ? table.width : 0),
    y,
  });
  const endSide = from === to ? direction : -direction;
  const start = anchor(from, ay, direction);
  const end = anchor(to, by, endSide);
  const mid = start.x + (end.x - start.x) * link.lane;
  const top = Math.min(from.y, to.y) - 28;
  const preferred =
    from === to
      ? [
          start,
          { x: start.x + 50, y: ay },
          { x: start.x + 50, y: ay === by ? by - 24 : by },
          { x: end.x + 28, y: ay === by ? by - 24 : by },
          { x: end.x + 28, y: by },
          end,
        ]
      : direction * (end.x - start.x) >= 52
        ? [start, { x: mid, y: ay }, { x: mid, y: by }, end]
        : [
            start,
            { x: start.x + direction * 28, y: ay },
            { x: start.x + direction * 28, y: top },
            { x: end.x + endSide * 28, y: top },
            { x: end.x + endSide * 28, y: by },
            end,
          ];
  const cards = [...tables.values()];
  const makeBoxes = (padding: number) =>
    cards.map((table) => ({
      left: table.x - padding,
      right: table.x + table.width + padding,
      top: table.y - padding,
      bottom: table.y + table.height + padding,
    }));

  // Keep the usual lanes when clear. Only the first and last segments may
  // enter their own table's clearance area to reach the field.
  const padded = makeBoxes(12);
  const fromIndex = cards.indexOf(from);
  const toIndex = cards.indexOf(to);
  if (
    preferred.slice(1).every((point, index) =>
      segmentClear(
        preferred[index],
        point,
        padded.filter(
          (_, box) =>
            !(index === 0 && box === fromIndex) &&
            !(index === preferred.length - 2 && box === toIndex),
        ),
      ),
    )
  ) {
    return compactPath(preferred);
  }

  const sides = [
    [direction, endSide],
    [direction, -endSide],
    [-direction, endSide],
    [-direction, -endSide],
  ];
  // Retry with a smaller gap when cards have been dragged close together.
  for (const [padding, lead] of [
    [12, 26],
    [1, 1],
  ]) {
    const boxes = padding === 12 ? padded : makeBoxes(padding);
    const fromObstacles = boxes.filter((_, index) => index !== fromIndex);
    const toObstacles = boxes.filter((_, index) => index !== toIndex);
    for (const [fromSide, toSide] of sides) {
      if (from === to && ay === by && fromSide === toSide) continue;
      const a = anchor(from, ay, fromSide);
      const b = anchor(to, by, toSide);
      const exit = { x: a.x + fromSide * lead, y: ay };
      const entry = { x: b.x + toSide * lead, y: by };
      if (
        !segmentClear(a, exit, fromObstacles) ||
        !segmentClear(entry, b, toObstacles)
      )
        continue;
      const path = routeAround(exit, entry, boxes);
      if (path) {
        const points = compactPath([a, ...path, b]);
        return padding === 12
          ? points
          : points.map((point) => ({ ...point, squareCorner: true }));
      }
    }
  }

  // Overlapping cards can cover a field on both sides.
  return compactPath(preferred);
}
