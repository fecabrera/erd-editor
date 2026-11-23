import type { Point } from "./schema";

export interface RoutingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function segmentClear(a: Point, b: Point, boxes: RoutingBox[]) {
  return boxes.every(({ left, right, top, bottom }) =>
    a.x === b.x
      ? a.x <= left ||
        a.x >= right ||
        Math.max(a.y, b.y) <= top ||
        Math.min(a.y, b.y) >= bottom
      : a.y <= top ||
        a.y >= bottom ||
        Math.max(a.x, b.x) <= left ||
        Math.min(a.x, b.x) >= right,
  );
}

export function routeAround(
  start: Point,
  end: Point,
  boxes: RoutingBox[],
): Point[] | undefined {
  // Each box edge defines a lane. Adjacent intersections form a grid that
  // can route through narrow gaps and around groups of overlapping boxes.
  const xs = [
    ...new Set([start.x, end.x, ...boxes.flatMap((b) => [b.left, b.right])]),
  ].sort((a, b) => a - b);
  const ys = [
    ...new Set([start.y, end.y, ...boxes.flatMap((b) => [b.top, b.bottom])]),
  ].sort((a, b) => a - b);
  const cell = ({ x, y }: Point) => ys.indexOf(y) * xs.length + xs.indexOf(x);
  const point = (index: number) => ({
    x: xs[index % xs.length],
    y: ys[Math.floor(index / xs.length)],
  });
  const distance = (a: Point, b: Point) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const first = cell(start);
  const last = cell(end);
  const open = new Map([[first, distance(start, end)]]);
  const costs = new Map([[first, 0]]);
  const parents = new Map<number, number>();

  while (open.size) {
    let current = first;
    let bestScore = Infinity;
    for (const [index, score] of open) {
      if (
        score < bestScore ||
        (score === bestScore && costs.get(index)! > costs.get(current)!)
      ) {
        current = index;
        bestScore = score;
      }
    }
    if (current === last) {
      const path = [end];
      while (current !== first) {
        current = parents.get(current)!;
        path.push(point(current));
      }
      return path.reverse();
    }
    open.delete(current);
    const here = point(current);
    const column = current % xs.length;
    const neighbors = [];
    if (column > 0) neighbors.push(current - 1);
    if (column + 1 < xs.length) neighbors.push(current + 1);
    if (current >= xs.length) neighbors.push(current - xs.length);
    if (current + xs.length < xs.length * ys.length)
      neighbors.push(current + xs.length);
    for (const next of neighbors) {
      const there = point(next);
      const cost = costs.get(current)! + distance(here, there);
      if (
        cost >= (costs.get(next) ?? Infinity) ||
        !segmentClear(here, there, boxes)
      )
        continue;
      costs.set(next, cost);
      parents.set(next, current);
      open.set(next, cost + distance(there, end));
    }
  }
}

export function compactPath(points: Point[]) {
  const path: Point[] = [];
  for (const next of points) {
    const last = path.at(-1);
    if (last?.x === next.x && last.y === next.y) continue;
    const previous = path.at(-2);
    if (
      previous &&
      last &&
      ((previous.x === last.x &&
        last.x === next.x &&
        (last.y - previous.y) * (next.y - last.y) > 0) ||
        (previous.y === last.y &&
          last.y === next.y &&
          (last.x - previous.x) * (next.x - last.x) > 0))
    ) {
      path.pop();
    }
    path.push(next);
  }
  return path;
}
