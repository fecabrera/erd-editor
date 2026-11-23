import assert from "node:assert/strict";
import { test } from "node:test";
import { cn } from "../app/ui/cn";

test("preserves the UI text size alongside a text color", () => {
  assert.equal(
    cn("text-ui-size/[normal]", "text-ui-ink"),
    "text-ui-size/[normal] text-ui-ink",
  );
});

test("allows callers to replace default Tailwind utilities", () => {
  assert.equal(
    cn("text-ui-size/[normal] p-2", "text-lg p-4"),
    "text-lg p-4",
  );
});

test("merges custom UI corner radii with default Tailwind radii", () => {
  assert.equal(cn("rounded-ui", "rounded-xl"), "rounded-xl");
  assert.equal(cn("rounded-s-ui-edge", "rounded-s-md"), "rounded-s-md");
});
