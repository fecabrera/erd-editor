# Workspace menu

## Scope

A single floating burger button opens the actions for export and theme.
[Menu markup](../../app/editor-workspace.tsx) · [Menu events](../../src/editor-controller.ts)

## Menu behavior

- The Lucide Menu button is named **Workspace menu**. It toggles the panel
  and reflects its expanded state via `aria-expanded`.
- The panel contains **Export image** with the Image Down icon, a centered
  divider, and a **Theme** row. The theme group uses Sun, Moon, and Monitor icons for
  **Light theme**, **Dark theme**, and **Follow system theme**, in that order.
- The menu closes on a second trigger activation, on an outside pointer
  press, when focus moves outside the workspace menu, or on Escape. Escape
  returns focus to the burger. The tab order follows the markup.
- **Export image** is available after a successful parse with at least one
  table. The menu item shows **⇧⌘E** on macOS or **Ctrl+Shift+E** on other
  platforms, in the same font as its label. The shortcut opens the dialog
  from anywhere in the workspace. Opening the dialog closes the menu.
  Closing the dialog returns focus to the burger.
- Activating a swatch keeps the menu open, updates the selected button's
  `aria-pressed` state, and applies the theme to the whole interface and
  diagram. Follow system is the default when no theme preference is saved.
  The chosen preference is saved locally.
  Follow system resolves against `prefers-color-scheme` on load and responds
  to device appearance changes. Manual theme choices stay fixed.

[Export dialog](../export/image-export.md) · [Storage behavior](../runtime/application.md)

## Acceptance criteria

- Keyboard and pointer users can reach the same menu actions.
- The divider has equal gaps to the two rows. Both rows are 32 px tall.
- The first rendered frame uses the saved theme or the system appearance.
- Theme selection updates the canvas palette and survives a reload where
  browser storage is available.
