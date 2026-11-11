# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Project overview

House Cue is a clickable design prototype built from Figma designs, with a Storybook that documents its components. It follows the same setup as the sibling `hub360` project.

- Figma source: _not linked yet_ (add the file URL and file key here once known)
- Git remote: _none yet_

## Commands

```bash
npm run dev                # prototype app on http://localhost:5174
npm run build              # type check + production build of the app to dist/
npm run storybook          # Storybook on http://localhost:6008
npm run build-storybook    # static build to storybook-static/
npm run typecheck          # tsc --noEmit
```

Ports 5174 / 6008 are chosen so House Cue can run next to hub360 (5173 / 6007). `.claude/launch.json` defines `app` and `storybook` for the preview pane.

## Structure and conventions

- `src/app/` holds the prototype app: `main.tsx` mounts it inside a `BrowserRouter` (base from `APP_BASE`), `App.tsx` holds the routes.
- `src/components/<Name>/` holds one component: `Name.tsx`, `Name.css`, `Name.stories.tsx`. Class names use the `hc-` prefix (BEM-style modifiers, e.g. `hc-button--primary`).
- `src/styles/tokens.css` holds the design tokens as CSS variables. They are placeholders until real tokens come from Figma. Dark mode switches when `data-theme="dark"` is on `<html>`; the Storybook toolbar has a Theme toggle that sets it.
- Style with the token variables, not hardcoded colors or sizes.
- Every component gets a story; link it to its Figma node with the `design` parameter (`@storybook/addon-designs`) once Figma URLs are known.
- Run `npm run typecheck` before committing.
