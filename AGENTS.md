# Schema Studio repository instructions

## Scope and structure

Schema Studio is a browser-local DBML editor and ERD preview. Use the Next.js
App Router, strict TypeScript, Tailwind CSS, Canvas 2D, and Lucide. Keep the
app compatible with Next.js static export.

- `app/` owns the route, page layout, and React workspace markup.
- `src/editor-controller.ts` owns input, browser storage, theme, canvas
  interaction, and export. Keep browser effects inside the client lifecycle
  and clean up listeners, timers, animation frames, and observers on unmount.
- `src/schema.ts` owns DBML normalization, Dagre layout, and connector paths.
  Keep parser-specific behavior and types at this boundary.
- `src/draw.ts` draws the diagram for both the preview and image export. Read
  the theme palette from `src/style.css`.
- `test/` contains the TypeScript parser and layout tests.
- `specs/` contains feature behavior, design rules, and acceptance criteria.
  [Specification index](specs/README.md)

## Design and behavior

- Reuse the Tailwind tokens and utilities in `src/style.css`. The interface
  uses the summary's `0.75rem` text size. Lucide icons use the shared 16 × 16 px
  size. Keep the primary floating controls and editor bars at 36 px high,
  menu rows at 32 px high, and theme swatches at 28 × 24 px.
  [Design system](specs/ui/design-system.md)
- Keep the canvas full-window. Float the editor on the left at desktop widths
  and at the bottom on phones. Keep Fit clear of the floating controls.
  [Workspace layout](specs/ui/workspace.md)
- Keep Export image and the theme swatches in the workspace menu. The
  swatches appear in Light, Dark, System order. Default to Follow system
  when there is no saved preference.
  [Workspace menu](specs/ui/workspace-menu.md)
- Keep DBML parsing and image generation in the browser. Preserve saved draft
  and theme behavior in local storage. Use the same drawing code for preview
  and export. Export the full scene, with a solid theme background for JPG
  and either a solid or transparent background for PNG.
  [Editor behavior](specs/editor/dbml-editor.md) · [Image export](specs/export/image-export.md)

## Development and verification

- Run `npm ci` to install dependencies from the lockfile. Use `npm run dev`
  for local development on port 4173.
- Run `npm run typecheck`, `npm test`, and `npm run build` for implementation
  changes. Serve an existing static build with `npm run preview`.
- Add or update a regression test when parser, normalization, or layout
  behavior changes. Check UI changes in a browser at desktop and mobile
  widths in both themes. Exercise the affected keyboard controls and verify
  downloaded files when changing export.
- Update the relevant scoped spec when behavior or design changes. Edit the
  source files to update the app. Treat `.next/` and `out/` as generated
  outputs.
- Preserve unrelated changes. Commit, push, or publish only when requested.
- Follow Conventional Commits 1.0.0 for commit messages. Use a header such as
  `fix: match the zoom controls to the diagram summary`. Write the summary and
  any body in plain language. State what changed directly and use the body
  when the reason needs more context.
  [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/)
