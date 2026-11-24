import { getKeyBadges, keyBadgeGap, keyBadgeGroupGap, keyBadgePadding } from "./key-badges";
import {
  HEADER,
  ROW,
  highlightConnections,
  highlightField,
  routeLink,
  tableTargetAtPoint,
} from "./schema";
import type {
  TableTarget,
  Point,
  PositionedLink,
  PositionedTable,
  Scene,
} from "./schema";

const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const mono = 'ui-monospace, "SFMono-Regular", Consolas, monospace';
export const fonts = {
  title: `700 16px ${font}`,
  field: `500 14.5px ${font}`,
  primary: `700 14.5px ${font}`,
  type: `500 12.5px ${mono}`,
  badge: `700 9px ${mono}`,
};

const diagramColors = [
  "dot",
  "header",
  "card",
  "border",
  "title",
  "field",
  "type",
  "line",
  "highlightLine",
  "highlightRow",
  "badge",
  "badgeInk",
  "shadow",
] as const;

export type Palette = { background: string } & Record<
  (typeof diagramColors)[number],
  string
>;

export function readPalette(style: CSSStyleDeclaration): Palette {
  return {
    background: style.getPropertyValue("--canvas").trim(),
    ...Object.fromEntries(
      diagramColors.map((key) => [
        key,
        style.getPropertyValue(`--diagram-${key}`).trim(),
      ]),
    ),
  } as Palette;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  view: Point & { scale: number },
  width: number,
  height: number,
  palette: Palette,
) {
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);
  const step = 20 * view.scale * Math.max(1, Math.ceil(0.7 / view.scale));
  ctx.fillStyle = palette.dot;
  ctx.beginPath();
  for (let x = ((view.x % step) + step) % step; x < width; x += step) {
    for (let y = ((view.y % step) + step) % step; y < height; y += step) {
      ctx.rect(x, y, 1.2, 1.2);
    }
  }
  ctx.fill();
}

export function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  palette: Palette,
) {
  const width = end.x - start.x;
  const height = end.y - start.y;
  ctx.save();
  ctx.fillStyle = palette.highlightLine;
  ctx.globalAlpha = 0.14;
  ctx.fillRect(start.x, start.y, width, height);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.highlightLine;
  ctx.strokeRect(start.x, start.y, width, height);
  ctx.restore();
}

function roundedConnector(points: ReturnType<typeof routeLink>) {
  const path = new Path2D();
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    const incoming = Math.hypot(current.x - previous.x, current.y - previous.y);
    const outgoing = Math.hypot(next.x - current.x, next.y - current.y);
    const radius = current.squareCorner
      ? 0
      : Math.min(11, incoming / 2, outgoing / 2);
    if (!radius) {
      path.lineTo(current.x, current.y);
      continue;
    }
    path.lineTo(
      current.x + ((previous.x - current.x) * radius) / incoming,
      current.y + ((previous.y - current.y) * radius) / incoming,
    );
    path.quadraticCurveTo(
      current.x,
      current.y,
      current.x + ((next.x - current.x) * radius) / outgoing,
      current.y + ((next.y - current.y) * radius) / outgoing,
    );
  }
  const last = points[points.length - 1];
  path.lineTo(last.x, last.y);
  return path;
}

function addCardinality(
  path: Path2D,
  endpoint: Point,
  adjacent: Point,
  spec: { many: boolean; optional: boolean },
) {
  const direction = Math.sign(adjacent.x - endpoint.x) || 1;
  const x = endpoint.x;
  const y = endpoint.y;
  if (spec.many) {
    path.moveTo(x, y - 5);
    path.lineTo(x + direction * 12, y);
    path.lineTo(x, y + 5);
  } else {
    path.moveTo(x + direction * 10, y - 5);
    path.lineTo(x + direction * 10, y + 5);
  }
  if (spec.optional) {
    const center = x + direction * 19;
    path.moveTo(center + 3.1, y);
    path.arc(center, y, 3.1, 0, Math.PI * 2);
  }
}

function card(
  ctx: CanvasRenderingContext2D,
  table: PositionedTable,
  palette: Palette,
  highlightedFields?: ReadonlySet<string>,
  outlined = false,
) {
  const { x, y, width, height } = table;
  ctx.save();
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = palette.card;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 7);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.clip();
  ctx.fillStyle = palette.header;
  ctx.fillRect(x, y, width, HEADER);
  ctx.fillStyle = palette.title;
  ctx.font = fonts.title;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(table.name, x + 14, y + HEADER / 2 + 1);
  table.fields.forEach((field, index) => {
    const rowY = y + HEADER + ROW * index;
    const center = rowY + ROW / 2 + 1;
    if (highlightedFields?.has(field.name)) {
      ctx.fillStyle = palette.highlightRow;
      ctx.fillRect(x, rowY, width, ROW);
    }
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(x + 12, rowY);
    ctx.lineTo(x + width - 12, rowY);
    if (index) ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillStyle = palette.field;
    ctx.font = field.primary ? fonts.primary : fonts.field;
    ctx.fillText(field.name, x + 14, center);
    const leftBadges = getKeyBadges(field, "left");
    if (leftBadges.length) {
      let badgeX = x + 14 + ctx.measureText(field.name).width + keyBadgeGroupGap;
      ctx.font = fonts.badge;
      for (const { label } of leftBadges) {
        const badgeWidth = ctx.measureText(label).width + 2 * keyBadgePadding;
        drawFieldBadge(ctx, palette, label, badgeX, center, badgeWidth);
        badgeX += badgeWidth + keyBadgeGap;
      }
    }
    const rightBadges = getKeyBadges(field, "right");
    let typeRight = x + width - 14;
    ctx.font = fonts.badge;
    for (let index = rightBadges.length - 1; index >= 0; index--) {
      const { label } = rightBadges[index];
      const badgeWidth = ctx.measureText(label).width + 2 * keyBadgePadding;
      const badgeX = typeRight - badgeWidth;
      drawFieldBadge(ctx, palette, label, badgeX, center, badgeWidth);
      typeRight = badgeX - (index === 0 ? keyBadgeGroupGap : keyBadgeGap);
    }
    ctx.textAlign = "right";
    ctx.fillStyle = palette.type;
    ctx.font = fonts.type;
    ctx.fillText(field.type, typeRight, center);
  });
  ctx.restore();

  ctx.strokeStyle = outlined ? palette.highlightLine : palette.border;
  ctx.lineWidth = outlined ? 1.3 : 0.8;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 7);
  ctx.stroke();
}

function drawFieldBadge(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  label: string,
  x: number,
  center: number,
  width: number,
) {
  ctx.fillStyle = palette.badge;
  ctx.beginPath();
  ctx.roundRect(x, center - 7, width, 14, 3);
  ctx.fill();
  ctx.fillStyle = palette.badgeInk;
  ctx.fillText(label, x + keyBadgePadding, center + 0.3);
}

const connectorPaths = new WeakMap<
  Scene,
  Map<PositionedLink, Path2D | undefined>
>();

export function invalidateConnectorPaths(scene: Scene) {
  connectorPaths.delete(scene);
}

function connectionPath(scene: Scene, link: PositionedLink) {
  let paths = connectorPaths.get(scene);
  if (!paths) {
    paths = new Map();
    connectorPaths.set(scene, paths);
  }
  if (paths.has(link)) return paths.get(link);

  const points = routeLink(link, scene.byId);
  let path: Path2D | undefined;
  if (points.length >= 2) {
    path = roundedConnector(points);
    addCardinality(path, points[0], points[1], link.from);
    addCardinality(
      path,
      points[points.length - 1],
      points[points.length - 2],
      link.to,
    );
  }
  paths.set(link, path);
  return path;
}

export interface DiagramHover {
  table?: TableTarget;
  connection?: PositionedLink;
}

export function hoverAtPoint(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  point: Point,
  scale: number,
): DiagramHover | undefined {
  const table = tableTargetAtPoint(scene.tables, point);
  if (table) return { table };
  if (!scene.links.length) return;

  ctx.save();
  ctx.resetTransform();
  ctx.lineWidth = 12 / scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const connection = scene.links.findLast((link) => {
    const path = connectionPath(scene, link);
    return path && ctx.isPointInStroke(path, point.x, point.y);
  });
  ctx.restore();
  if (connection) return { connection };
}

export function drawGraph(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  palette: Palette,
  hovered?: DiagramHover,
  selectedTableIds?: ReadonlySet<string>,
) {
  const highlight = hovered?.connection
    ? highlightConnections([hovered.connection])
    : hovered?.table && highlightField(scene.links, hovered.table);
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1.45;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const link of scene.links) {
    if (highlight?.connections.has(link)) continue;
    const path = connectionPath(scene, link);
    if (path) ctx.stroke(path);
  }
  if (highlight?.connections.size) {
    ctx.strokeStyle = palette.highlightLine;
    ctx.lineWidth = 2.35;
    for (const link of highlight.connections) {
      const path = connectionPath(scene, link);
      if (path) ctx.stroke(path);
    }
  }
  for (const table of scene.tables) {
    card(
      ctx,
      table,
      palette,
      highlight?.rows.get(table.id),
      hovered?.table?.tableId === table.id || selectedTableIds?.has(table.id),
    );
  }
}
