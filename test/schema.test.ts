import assert from "node:assert/strict";
import { test } from "node:test";
import { example } from "../src/example";
import {
  describeError,
  tableIdsInRectangle,
  tableTargetAtPoint,
  HEADER,
  highlightConnections,
  highlightField,
  ROW,
  graphBounds,
  layoutSchema,
  parseSchema,
  routeLink,
} from "../src/schema";

test("parses the example and marks referenced columns", () => {
  const { tables, links } = parseSchema(example);
  const orders = tables.find((table) => table.name === "orders");
  assert.ok(orders);
  assert.equal(tables.length, 5);
  assert.equal(links.length, 4);
  assert.equal(
    orders.fields.find((field) => field.name === "id")?.primary,
    true,
  );
  assert.equal(
    orders.fields.find((field) => field.name === "customer_id")?.foreign,
    true,
  );
});

test("accepts an inline nullable foreign key to a different schema", () => {
  const { tables, links } = parseSchema(`
    Table accounts.people {
      id bigint [pk]
    }
    Table orders {
      person_id bigint [ref: > accounts.people.id]
    }
  `);
  assert.equal(tables[0].name, "accounts.people");
  assert.equal(links[0].from.id, "accounts.people");
  assert.equal(links[0].from.optional, true);
  assert.equal(links[0].to.id, "public.orders");
});

test("uses the second endpoint as the foreign key for one-to-one references", () => {
  const { tables } = parseSchema(`
    Table people {
      id bigint [pk]
    }
    Table profiles {
      user_id bigint [unique, not null]
    }
    Ref: people.id - profiles.user_id
  `);
  assert.equal(tables[1].fields[0].foreign, true);
  assert.equal(tables[0].fields[0].foreign, false);
});

test("marks inline and single-column uniqueness without marking composite members", () => {
  const schema = parseSchema(`
    Table accounts {
      id int [pk]
      email varchar [unique]
      handle varchar
      region varchar
      code varchar

      indexes {
        handle [unique]
        (region, code) [unique]
      }
    }
  `);

  assert.deepEqual(
    schema.tables[0].fields.filter((field) => field.unique).map((field) => field.name),
    ["email", "handle"],
  );
  assert.equal(schema.tables[0].fields[1].required, false);
});

test("leaves room for all badges on a field and its type", () => {
  const fieldName = "account_identifier_with_a_long_name";
  const schema = parseSchema(`
    Table accounts {
      id int [pk]
    }
    Table profiles {
      ${fieldName} int [pk, unique, not null, ref: > accounts.id]
    }
  `);
  const typeWidth = 3 * 8;
  const nameWidth = fieldName.length * 9;
  const badgesWidth = 4 * (2 * 6 + 8) + 2 * 4;
  const { tables } = layoutSchema(schema, (text, font) => {
    if (font === "primary") return text.length * 9;
    if (font === "badge") return text.length * 6;
    return text.length * 8;
  });
  assert.equal(tables[1].width, 14 + nameWidth + 8 + badgesWidth + 12 + typeWidth + 8 + 14);
});

test("distinguishes explicit not null from required primary keys", () => {
  const { tables } = parseSchema(`
    Table accounts {
      id int [pk]
      name text [not null]
      bio text [null]
      email text
    }
  `);
  assert.deepEqual(
    tables[0].fields.map(({ name, notNull, required }) => [name, notNull, required]),
    [
      ["id", false, true],
      ["name", true, true],
      ["bio", false, false],
      ["email", false, false],
    ],
  );
});

test("routes a self relation outside the card and includes it in export bounds", () => {
  const schema = parseSchema(`
    Table folders {
      id int [pk]
      parent_id int [ref: > folders.id]
    }
  `);
  const scene = layoutSchema(schema, (text) => text.length * 8);
  const table = scene.tables[0];
  const byId = new Map([[table.id, table]]);
  const points = routeLink(scene.links[0], byId);
  assert.ok(points.some((point) => point.x > table.x + table.width));
  const bounds = graphBounds(scene, 0);
  assert.ok(bounds.width > table.width);
  assert.ok(
    points.every(
      ({ x, y }) =>
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height,
    ),
  );
});

test("returns empty data for a blank editor and explains invalid DBML", () => {
  assert.deepEqual(parseSchema("  "), { tables: [], links: [] });
  assert.throws(
    () => parseSchema("Table unfinished {"),
    (error) => /^Line 1 · /.test(describeError(error)),
  );
});

test("renders type parameters and schema qualification once", () => {
  const { tables } = parseSchema(`
    Table people {
      tzid varchar(100)
      amount numeric(12, 2)
      created_at "timestamp with time zone"
      status accounts.status
      tags text[]
    }
  `);

  assert.deepEqual(
    tables[0].fields.map(({ type }) => type),
    [
      "varchar(100)",
      "numeric(12, 2)",
      "timestamp with time zone",
      "accounts.status",
      "text[]",
    ],
  );
});

test("finds the hovered table and identifies its field when present", () => {
  const { tables } = layoutSchema(
    parseSchema(example),
    (text) => text.length * 8,
  );
  const table = tables.find((item) => item.name === "customers");
  assert.ok(table);
  assert.deepEqual(
    tableTargetAtPoint(tables, {
      x: table.x + 12,
      y: table.y + HEADER + ROW + 4,
    }),
    {
      tableId: "public.customers",
      fieldName: "email",
    },
  );
  assert.deepEqual(
    tableTargetAtPoint(tables, { x: table.x + 12, y: table.y + 8 }),
    { tableId: "public.customers", fieldName: undefined },
  );
  assert.equal(tableTargetAtPoint(tables, { x: -1, y: -1 }), undefined);
});

test("selects every table touched by a rectangle drawn in either direction", () => {
  const { tables } = layoutSchema(
    parseSchema("Table left_card {\n id integer\n}\nTable right_card {\n id integer\n}"),
    (text) => text.length * 8,
  );
  const [left, right] = tables;
  Object.assign(left, { x: 0, y: 0 });
  Object.assign(right, { x: left.width + 20, y: 0 });

  const start = { x: left.width - 10, y: -10 };
  const end = { x: right.x + 10, y: 10 };
  const expected = new Set([left.id, right.id]);
  assert.deepEqual(tableIdsInRectangle(tables, start, end), expected);
  assert.deepEqual(tableIdsInRectangle(tables, end, start), expected);
  assert.deepEqual(
    tableIdsInRectangle(
      tables,
      { x: left.width + 1, y: 0 },
      { x: right.x - 1, y: 10 },
    ),
    new Set(),
  );
});

test("highlights direct connections and their endpoint fields only", () => {
  const { links } = layoutSchema(
    parseSchema(example),
    (text) => text.length * 8,
  );
  assert.equal(
    highlightField(links, { tableId: "public.customers" }),
    undefined,
  );
  const connected = highlightField(links, {
    tableId: "public.customers",
    fieldName: "id",
  });
  assert.ok(connected);
  assert.equal(connected.connections.size, 1);
  assert.deepEqual(
    connected.rows,
    new Map([
      ["public.customers", new Set(["id"])],
      ["public.orders", new Set(["customer_id"])],
    ]),
  );

  const isolated = highlightField(links, {
    tableId: "public.customers",
    fieldName: "email",
  });
  assert.ok(isolated);
  assert.equal(isolated.connections.size, 0);
  assert.deepEqual(
    isolated.rows,
    new Map([["public.customers", new Set(["email"])]]),
  );
});

test("preserves selected rows and connections when adding hover highlights", () => {
  const { links } = layoutSchema(parseSchema(example), (text) => text.length * 8);
  const selected = highlightField(links, { tableId: "public.customers", fieldName: "id" });
  const combined = highlightField(links, { tableId: "public.customers", fieldName: "email" }, selected);
  assert.ok(combined);
  assert.deepEqual(combined.rows.get("public.customers"), new Set(["id", "email"]));
  const additionalLink = links.find((link) => link.from.id === "public.categories");
  assert.ok(additionalLink);
  const both = highlightConnections([additionalLink], combined.rows, combined.connections);
  assert.deepEqual(both.rows.get("public.customers"), new Set(["id", "email"]));
  assert.deepEqual(both.rows.get("public.categories"), new Set(["id"]));
  assert.equal(both.connections.size, 2);
});

test("highlights only the endpoint fields of the hovered connection", () => {
  const { links } = layoutSchema(
    parseSchema(example),
    (text) => text.length * 8,
  );
  const link = links.find(
    ({ from, to }) =>
      from.id === "public.orders" && to.id === "public.order_items",
  );
  assert.ok(link);
  const highlight = highlightConnections([link]);
  assert.deepEqual(highlight.connections, new Set([link]));
  assert.deepEqual(
    highlight.rows,
    new Map([
      ["public.orders", new Set(["id"])],
      ["public.order_items", new Set(["order_id"])],
    ]),
  );
});

test("routes an existing connection around a table moved into its lane", () => {
  const { tables, links } = layoutSchema(
    parseSchema(`
      Table admin_log {
        content_type_id int [ref: > content_type.id]
      }
      Table users {
        id int [pk]
      }
      Table content_type {
        id int [pk]
      }
    `),
    (text) => text.length * 8,
  );
  const [log, users, contentType] = tables;
  Object.assign(log, { x: 0, y: 0 });
  Object.assign(contentType, { x: 700, y: 200 });
  Object.assign(users, { x: 350, y: 325 });
  const byId = new Map(tables.map((table) => [table.id, table]));
  const [link] = links;
  const unobstructed = routeLink(link, byId);
  assert.equal(unobstructed.length, 4);

  // Cover the vertical segment between the two field rows.
  users.x = unobstructed[1].x - users.width / 2;
  users.y = 125;
  const rerouted = routeLink(link, byId);
  assert.notDeepEqual(rerouted, unobstructed);
  assert.deepEqual(rerouted[0], unobstructed[0]);
  assert.deepEqual(rerouted.at(-1), unobstructed.at(-1));
  for (let i = 1; i < rerouted.length; i++) {
    const a = rerouted[i - 1];
    const b = rerouted[i];
    if (a.x === b.x) {
      assert.ok(
        a.x < users.x ||
          a.x > users.x + users.width ||
          Math.max(a.y, b.y) < users.y ||
          Math.min(a.y, b.y) > users.y + users.height,
      );
    } else {
      assert.equal(a.y, b.y);
      assert.ok(
        a.y < users.y ||
          a.y > users.y + users.height ||
          Math.max(a.x, b.x) < users.x ||
          Math.min(a.x, b.x) > users.x + users.width,
      );
    }
  }
});
