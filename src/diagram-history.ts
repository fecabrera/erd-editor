import type { PositionedTable, Scene } from "./schema";

type TablePosition = Pick<PositionedTable, "x" | "y" | "moved">;

export type TableMoveStart = {
  table: PositionedTable;
  position: TablePosition;
};

type TableMove = {
  id: string;
  before: TablePosition;
  after: TablePosition;
};

export function createDiagramHistory() {
  const entries: TableMove[][] = [];
  let cursor = 0;

  function apply(
    tables: Scene["byId"],
    moves: TableMove[],
    state: "before" | "after",
  ) {
    for (const move of moves) {
      const table = tables.get(move.id);
      if (table) Object.assign(table, move[state]);
    }
  }

  return {
    get canUndo() {
      return cursor > 0;
    },
    get canRedo() {
      return cursor < entries.length;
    },
    record(starts: TableMoveStart[]) {
      const moves: TableMove[] = [];
      for (const { table, position } of starts) {
        if (table.x === position.x && table.y === position.y) {
          table.moved = position.moved;
          continue;
        }
        moves.push({
          id: table.id,
          before: position,
          after: { x: table.x, y: table.y, moved: table.moved },
        });
      }
      if (!moves.length) return;
      entries.splice(cursor, entries.length - cursor, moves);
      cursor++;
    },
    undo(tables: Scene["byId"]) {
      if (cursor === 0) return false;
      apply(tables, entries[--cursor], "before");
      return true;
    },
    redo(tables: Scene["byId"]) {
      if (cursor === entries.length) return false;
      apply(tables, entries[cursor++], "after");
      return true;
    },
    clear() {
      entries.length = 0;
      cursor = 0;
    },
  };
}
