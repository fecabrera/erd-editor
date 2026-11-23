# Image export

## Dialog

Open **Export image** from the workspace menu or press **Shift–Command–E**
on macOS or **Shift+Ctrl+E** on other platforms.
The dialog contains **Format** (PNG or JPG) and **Background** (Theme color or
Transparent). It defaults to PNG and Theme color on page load. The format
and background options and the Cancel and Download buttons are 32 px tall.
Cancel and Escape close the dialog. Focus returns to
the workspace menu button. [Dialog markup](../../app/editor-workspace.tsx)

| Format | Supported backgrounds | Output |
| --- | --- | --- |
| PNG | Theme color or transparency | `schema-diagram.png`, `image/png` |
| JPG | Theme color | `schema-diagram.jpg`, `image/jpeg`, quality 0.94 |

Switching to JPG selects Theme color, disables Transparent, and explains
that JPG requires a solid background. Switching back to PNG restores the
last PNG background choice during the current page session.

## Image generation

- Export is available only for a parseable schema with at least one table.
  Every download uses the current scene and the current palette.
- Draw into an offscreen canvas using the full card and connector bounds
  plus 40 units of padding. Table positions from manual dragging are
  included. The preview's pan, zoom, overlays, and dot grid do not affect
  the output.
- The output scale reaches 2× when size permits. The density also targets
  an 8192 px maximum dimension and a 26 million pixel area before rounding
  the final dimensions up.
- Fill Theme color using the active canvas background. Transparent PNG
  leaves the surrounding canvas pixels transparent.
- Encode with `toBlob`, download through a temporary object URL, and revoke
  the URL after one second. Show brief feedback for a generated download
  or when encoding yields no image.

[Export implementation](../../src/editor-controller.ts) · [Shared drawing code](../../src/draw.ts)

## Acceptance criteria

- A diagram can be exported as solid PNG, transparent PNG, and solid JPG.
- Transparent PNG has a transparent corner outside the scene. Solid
  exports use the active theme background.
- Export contains tables and relationships outside the current viewport.
