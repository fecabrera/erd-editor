# Design system

## Scope

Tailwind CSS supplies the interface layout, styling tokens, and interaction
states. The browser resolves the active theme's color variables for the
canvas and image renderer. [Tailwind source](../../src/style.css)

## Typography and geometry

| Element | Specification |
| --- | --- |
| Interface text | `--text-ui-size` at `0.75rem` or 12 px with the default root size. It applies to the summary, legend, editor heading and code, menu, controls, dialogs, and feedback. |
| Font family | System sans serif with Inter first. The editor and SQL type text use system monospace. |
| Shared control height | `--floating-control-height` at `2.25rem` or 36 px by default. It applies to the editor header and footer, burger button, summary, and zoom group. |
| Burger and theme buttons | The burger is square. The light, dark, and system swatches each measure 28 × 24 px by default, with 3 px between swatches. |
| Icons | Lucide SVGs share a 16 × 16 px default size through the base styling rule. |
| Buttons | Standard buttons use a 40 px minimum height and an 8 px radius. The export dialog uses 32 px options and footer buttons. The primary action uses the theme accent. |
| Menu | 32 px rows, 12 px radius, 6 px internal padding, and a 1 px divider with 6 px above and below it. |
| Export dialog | 14 px radius, themed surface, and a dimmed backdrop. |

Canvas card lettering and badge sizes are part of the diagram renderer.
[Canvas rendering specification](../canvas/rendering-and-navigation.md)

## Palette

| Token or role | Light | Dark |
| --- | --- | --- |
| Surface | `#ffffff` | `#303138` |
| Subtle surface | `#f6f8fb` | `#2a2b32` |
| Control surface | `#ffffff` | `#383a43` |
| Hover surface | `#edf3f9` | `#43454e` |
| Border | `#dce3eb` | `#4c4e57` |
| Text | `#172b40` | `#f2f2f4` |
| Secondary text | `#53677d` | `#c2c4ce` |
| Accent / hover | `#27648e` / `#205477` | `#3d7197` / `#4a7fa6` |
| Focus and selected outline | `#467cab` | `#85b8eb` |
| Success status | `#268062` | `#8ed6ba` |
| Error text / background | `#a53035` / `#fdf0ee` | `#ffc0bf` / `#4e3037` |
| Canvas | `#f3f5f8` | `#404149` |

The stylesheet also defines syntax colors, line-number color, canvas drawing
colors, and theme-specific legend text. The displayed sizes in px assume a
16 px root font size. [Complete token definitions](../../src/style.css)

## Interaction and acceptance criteria

- Keyboard focus is visible on buttons and the canvas. Icon-only controls
  have accessible names. Decorative icons are hidden from assistive technology.
- Disabled actions use lower opacity. The selected theme swatch has a tinted
  surface and inset ring as well as the accessible pressed state. Unselected
  swatches and their container have no frame.
- The interface text, control heights, and icon dimensions stay consistent
  when switching themes or resizing the window.
