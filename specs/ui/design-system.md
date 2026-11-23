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
| Corner radius | Surfaces and controls use `rounded-ui` at 8 px. The end buttons in the zoom group use the `--radius-ui-edge` token, which subtracts the group's 1 px border from the shared radius. |
| Floating surfaces | The burger button, diagram info, and zoom group share the theme surface, border, secondary foreground color, and small shadow. |
| Diagram toolbar | The buttons are 32 × 32 px, with 4 px of toolbar padding and a 4 px gap. Each button shows its main shortcut in the bottom-right corner. The toolbar is 42 px high, including its border. |
| Zoom controls | Zoom Out, Zoom In, and Fit share a 35 px button width. |
| Burger and theme buttons | The burger is square. The light, dark, and system swatches each measure 28 × 24 px by default, with 3 px between swatches. |
| Icons | Lucide SVGs share a 16 × 16 px default size through the base styling rule. |
| Buttons | Standard buttons use a 40 px minimum height. The export dialog uses 32 px options and footer buttons. The primary action uses the theme accent. |
| Menu | 32 px rows, 6 px internal padding, and a 1 px divider with 6 px above and below it. |
| Export dialog | Themed surface and dimmed backdrop. |

Canvas card lettering and badge sizes are part of the diagram renderer.
[Canvas rendering specification](../canvas/rendering-and-navigation.md)

## React components

| Component | Usage |
| --- | --- |
| `Button` | Use the standard or primary style for actions, or the plain variant with custom styles. The toggle variant shares the standard radius and pressed ring across theme swatches and toolbar buttons. The default type is `button`. Set `type="submit"` for form submission. |
| `Choice` | Renders a styled radio option with a clickable label. Give related options the same `name` and group them in a fieldset with a legend. |
| `Dialog` | Renders a native dialog with a themed surface and dimmed backdrop. Give it an accessible name and use `showModal()` and `close()` to control it. |
| `Group` | Arrange related elements in a row or grid. Supply spacing and alignment through `className` and add a group role and label when the controls need an accessible name. |
| `Input` | Renders a native text input with the shared focus outline. Give the field an accessible label and set its width and alignment through `className`. |
| `Dropdown` | Renders a trigger and a panel linked by ID. The caller owns open state, dismissal, focus behavior, and placement. The panel can use `Menu` or hold other controls. |
| `Menu` | Provides the themed panel, with `MenuItem` for action buttons and `MenuSeparator` for visual dividers. Actions use native buttons and normal Tab navigation. |
| `Card` | Provides a themed surface for content. Use an `article` or labeled `section` when the content calls for one. |
| `Toast` | Displays a status message at the bottom of the viewport. The caller supplies the message and controls visibility and dismissal timing. |

[Component source](../../app/ui/)

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

- Keyboard focus is visible on buttons. Icon-only controls
  have accessible names. Decorative icons are hidden from assistive technology.
- Disabled actions use lower opacity. The selected theme swatch has a tinted
  surface and inset ring as well as the accessible pressed state. Unselected
  swatches and their container have no frame.
- The interface text, control heights, and icon dimensions stay consistent
  when switching themes or resizing the window.
