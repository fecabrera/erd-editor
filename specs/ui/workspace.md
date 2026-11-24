# Workspace layout

## Scope

The workspace contains a full-window diagram canvas and floating controls.
The DBML source stays editable while the diagram is being viewed. The export
dialog opens above the workspace. [Workspace markup](../../app/editor-workspace.tsx)

## Layout

- The workspace occupies `100dvh`. The preview and its canvas reach all four
  edges, including the area behind the editor. The page has no outer scroll.
- At viewport widths of 761 px and above, the editor floats on the left. Its
  width is `clamp(17rem, 26vw, 24rem)` and its bottom edge is inset by 16 px.
  Its top edge starts 12 px below the burger button.
- Below 761 px, the editor floats across the bottom with 12 px side and bottom
  insets. Its height is `clamp(9.75rem, 38dvh, 18rem)`. The editor text scrolls
  within the card.
- The burger button sits at the top left and the diagram summary sits at the
  top right. Both use the same top inset. The summary shows table and
  relationship counts and a PK/FK legend. Below 761 px, it shows the count
  without the legend.
- The diagram toolbar sits at the top center. Undo and Redo sit to the left
  of the divider, followed by Pointer and Hand. At 1040 px and below, the
  toolbar moves to the row beneath the burger and summary.
- The zoom controls sit at the bottom right on wider screens. Below 761 px,
  they sit 12 px above the editor. The menu opens below its trigger, above
  both the editor and the canvas.
- The editor card uses the shared 8 px corner radius. Its header shows
  **Editor** and its footer shows schema status and line count. Syntax
  diagnostics appear immediately above the footer.
- The empty preview message is centered in the visible diagram area, to
  the right of the editor or above it on narrow screens.

[Layout tokens](../../src/style.css) · [Diagram fitting and navigation](../canvas/rendering-and-navigation.md)

## Acceptance criteria

- The canvas fills the viewport and can be panned independently of the editor.
- The editor, summary, diagram toolbar, zoom controls, and menu remain
  reachable on desktop and phone widths.
- Displaying a syntax error leaves the header and footer dimensions intact.
