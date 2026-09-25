# Project notes for Claude

React prototype of the Claude Code desktop app (Vite + React 19 + TS + Tailwind v4), rebuilt 1:1 from an Alloy prototype. `original/` holds the untouched Alloy build for comparison; the sidebar has since diverged on purpose (project-grouped chats, `/routines` page), so parity checks apply to the chat pane only.

## Building UI — follow docs/DESIGN_GUIDE.md
- Colors, spacing, type, radius, shadows, and motion come ONLY from `--cds-*` tokens (Tailwind classes mapped in `src/styles/tailwind.css`, or `var(--cds-…)`). No hex values, no default Tailwind palette.
- Render inside a `.cds-root` scope (`<Theme>` from `src/ui`); tokens resolve per `data-mode` / `data-density`.
- Reuse `src/ui` primitives (`Button`, `Icon`, `Theme`, `PageHeader`, `Tabs`, `EmptyState`, `WavyDivider`, `ListCard`, `Menu*`). For other components, copy the `data-cds="…"` markup pattern from `src/components`; the design-system CSS styles them.
- Icons: Anthropicons private-use glyphs via `<Icon glyph={"\uE0xx"} />`; the catalog is at `/tokens#icons`.
- Token reference: `docs/DESIGN_TOKENS.md`, `src/design-system/tokens.json`, and the live `/tokens` page.

## Inbox section
- `/inbox` and its task pane are specified in `docs/INBOX.md` (PRD + design doc: principles, structure, architecture, decision log). Read it before changing the section; update it when a decision changes.

## Don't
- Don't edit `src/styles/design-system.css` (the original compiled CSS). Import order in `main.tsx` matters: design-system.css first, then tailwind.css.
- Don't "fix" literal `&amp;` inside class strings in `src/components`: the original has them too, and fixing them changes layout.

## Verify
- `npm run typecheck`, `npm run build`.
- Visual parity: `npm run dev` (:5173/code) vs `npm run original` (:5174/code) at the same viewport size.
