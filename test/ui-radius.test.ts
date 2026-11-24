import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Choice } from "../app/ui/choice";
import { Dialog } from "../app/ui/dialog";
import { Group } from "../app/ui/group";
import { Input } from "../app/ui/input";
import { Menu, MenuItem } from "../app/ui/menu";
import { Toast } from "../app/ui/toast";

test("applies Group radius to its classes without forwarding the prop to the DOM", () => {
  const markup = renderToStaticMarkup(
    createElement(Group, { variant: "floating", radius: "sm" }),
  );
  assert.match(markup, /\brounded-sm\b/);
  assert.doesNotMatch(markup, /\brounded-lg\b|\bradius="/);
});

test("passes the MenuItem radius to its button", () => {
  const markup = renderToStaticMarkup(
    createElement(MenuItem, { radius: "none" }, "Export image"),
  );
  assert.match(markup, /\brounded-none\b/);
  assert.doesNotMatch(markup, /\brounded-lg\b|\bradius="/);
});

test("uses the same radius defaults and overrides on shared surfaces and controls", () => {
  type OverrideProps = { radius?: "md"; className?: string };
  const cases = [
    (props: OverrideProps) =>
      createElement(Choice, { ...props, children: "Theme color" }),
    (props: OverrideProps) => createElement(Dialog, props),
    (props: OverrideProps) => createElement(Input, props),
    (props: OverrideProps) => createElement(Menu, props),
    (props: OverrideProps) => createElement(Toast, props),
  ];

  for (const element of cases) {
    assert.match(renderToStaticMarkup(element({})), /\brounded-lg\b/);
    const variant = renderToStaticMarkup(element({ radius: "md" }));
    assert.match(variant, /\brounded-md\b/);
    assert.doesNotMatch(variant, /\brounded-lg\b|\bradius="/);
    const override = renderToStaticMarkup(
      element({ radius: "md", className: "rounded-sm" }),
    );
    assert.match(override, /\brounded-sm\b/);
    assert.doesNotMatch(override, /\brounded-md\b/);
  }
});
