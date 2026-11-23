# Canvas rendering and navigation

## Rendering

The preview uses Canvas 2D and redraws on animation frames. Its backing
store scales with the device pixel ratio up to 2×. A resize observer tracks
the viewport. The renderer draws the background and dot grid, then
connectors, then table cards. [Canvas renderer](../../src/draw.ts) · [Viewport controller](../../src/editor-controller.ts)

| Element | Style |
| --- | --- |
| Grid | Theme background and 1.2 px dots. At 100% zoom, dots are 20 px apart. The grid adapts at low zoom and follows panning. |
| Table cards | Rounded 7 px corners, a subtle shadow and border, and a colored header. Light headers are blue `#2f648d`. Dark headers are charcoal `#222224`. |
| Fields | Left-aligned names and right-aligned type labels, with thin row dividers. Table titles are 16 px bold. Field names are 14.5 px, with bold primary keys. Types use 12.5 px monospace. |
| Key badges | PK, FK, or PK · FK in 9 px bold monospace beside the field name. |
| Connectors | Thin paths with rounded turns. Ticks mark one, crow's feet mark many, and circles mark optional ends. |

The renderer reads the palette from the active theme. Card colors, shadows,
borders, and connector colors share the same values in the preview and
exports. [Canvas palette tokens](../../src/style.css)

## Table selection and hover

**Pointer** starts selected in the diagram toolbar. It supports clicking to
select, dragging a selection box, and moving tables. Press **V** to switch
to Pointer or **M** to switch to Hand. In editable fields, both keys type
as usual.

Click or tap a table header or field row to select the table. With a mouse
or pen, drag from open canvas to draw a selection box. The preview outlines
each table the box touches, and releasing replaces the selection with those
tables. Selected cards keep the same outline used for hover. Click open
canvas or press Escape with canvas focus to clear the selection. During
box selection, Escape cancels the gesture. Schema edits preserve selected
tables that still exist under the same names. Selection appears in the
preview only.

Hovering anywhere on a table outlines the card. Hovering over a field also
highlights its row, any direct connections, and the rows at the other ends.
Moving from a row to its header keeps the card outline and clears the row
and connection highlights. Moving off the table or starting a drag clears
the hover outline. Hovering over a connector emphasizes the line and both
endpoint rows. The pointer can be up to 6 CSS px from its path. Table rows take
precedence where a connector runs behind a card. Hover styling is used in the preview only.

## Zoom and panning

- Start at 100% on a fresh load and center the diagram in the available
  area. Resizing or laying out a changed schema recenters at the current
  scale.
- Choose **Hand** to pan by dragging anywhere on the canvas. Holding Space
  or the middle mouse button on the canvas temporarily selects Hand in the
  toolbar. Releasing the last held shortcut restores the previous tool.
  On touch screens, dragging from open canvas pans in either mode.
- The canvas uses the regular arrow at rest, a crosshair while drawing a
  selection box, and the move cursor while dragging cards. Hand mode and
  holding either pan shortcut show the grab cursor, which changes to
  grabbing during a pan drag.
- Drag anywhere on a selected card to move the entire selection. Dragging
  an unselected card selects and moves just that card. Connector paths follow
  the cards. Pointer capture handles one active drag, and a drag begins after
  moving at least 4 CSS px.
- Scroll over a nonempty canvas to pan horizontally or vertically.
  Hold Shift while scrolling to pan horizontally.
  Ctrl-scroll, Command-scroll on macOS, and trackpad pinch zoom around the
  pointer. Plus and minus buttons adjust the current scale by 1.2× or its
  reciprocal around the center of the available area.
- Edit the percentage directly. Enter or leaving the field commits it.
  Escape restores the last value. An optional percent sign and decimal
  commas are accepted. Reject zero, negative, or invalid input, restore
  the previous value, and show feedback. Positive typed values are clamped
  to 0.1%–300%.
- **Fit** centers and scales the graph into the area clear of the editor,
  summary, diagram toolbar, and zoom controls, with an upper fitting scale
  of 114%.
- With canvas focus, arrows pan by 40 CSS px, plus and minus zoom, and
  zero calls Fit. The canvas remains focusable with its outline hidden.
  Its accessible name announces diagram counts and available keyboard controls.

## Acceptance criteria

- The preview starts at 100% at desktop and phone widths, with Fit available
  for diagrams larger than the visible area.
- Dragging a table updates its connectors. Zooming and panning do not change
  schema content.
- Box selection works in any drag direction. Panning keeps the current
  selection and dragging any selected card moves all selected cards together.
- A rejected zoom value leaves the previous view intact.
