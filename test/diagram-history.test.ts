import assert from "node:assert/strict";
import { test } from "node:test";
import { createDiagramHistory } from "../src/diagram-history";
import type { PositionedTable } from "../src/schema";

function tableAt(id: string, x: number, y: number): PositionedTable {
  return { id, name: id, fields: [], x, y, width: 200, height: 40 };
}

test("undoes and redoes a group move as one action across a scene rebuild", () => {
  const history = createDiagramHistory();
  const first = tableAt("first", 10, 20);
  const second = tableAt("second", 250, 40);
  const starts = [first, second].map((table) => ({
    table,
    position: { x: table.x, y: table.y, moved: table.moved },
  }));
  for (const table of [first, second]) {
    table.x += 25;
    table.y -= 10;
    table.moved = true;
  }
  history.record(starts);

  const tables = new Map([[first.id, { ...first }], [second.id, { ...second }]]);
  const positions = () =>
    [...tables.values()].map(({ x, y, moved }) => [x, y, moved]);
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);
  assert.equal(history.undo(tables), true);
  assert.deepEqual(positions(), [[10, 20, undefined], [250, 40, undefined]]);
  assert.equal(history.undo(tables), false);
  assert.equal(history.redo(tables), true);
  assert.deepEqual(positions(), [[35, 10, true], [275, 30, true]]);
  assert.equal(history.redo(tables), false);
});

test("keeps redo after a no-op and discards it after a new move or layout reset", () => {
  const history = createDiagramHistory();
  const table = tableAt("table", 0, 0);
  const tables = new Map([[table.id, table]]);
  table.x = 10;
  table.moved = true;
  history.record([{ table, position: { x: 0, y: 0 } }]);
  history.undo(tables);

  table.moved = true;
  history.record([{ table, position: { x: 0, y: 0 } }]);
  assert.equal(table.moved, undefined);
  assert.equal(history.canRedo, true);

  table.x = 30;
  table.moved = true;
  history.record([{ table, position: { x: 0, y: 0 } }]);
  assert.equal(history.canRedo, false);
  assert.equal(history.canUndo, true);
  history.undo(tables);
  history.clear();
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, false);
});
