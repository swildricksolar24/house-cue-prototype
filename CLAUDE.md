# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Project overview

House Cue is a clickable design prototype of HouseCue.ai, built from the Figma file "Claude — House Cue", with a Storybook that documents its components. It follows the same setup as the sibling `hub360` project.

- Figma source: [Claude — House Cue](https://www.figma.com/design/6kMDFUNggxvrwZN0ccl7FG/Claude--House-Cue), file key `6kMDFUNggxvrwZN0ccl7FG`. Pages: 00 Cover & Index (screen inventory and batch table), 01 Foundations (tokens, type, grids, HC/* components), Brand — Logo, batch pages B1–B16 / W2 / W3 (every screen: Mobile/Web × Light/Dark plus state frames), journey pages J1–J5 (screens in workflow order).
- Git remote: `origin` → https://github.com/swildricksolar24/house-cue-prototype (public), branch `main`
- Live site: every push to `main` runs `.github/workflows/pages.yml` (type check, then build) and publishes to GitHub Pages — prototype at https://swildricksolar24.github.io/house-cue-prototype/ (built with `APP_BASE=/house-cue-prototype/`; a copy of `index.html` is `404.html`, so deep links load) and Storybook at https://swildricksolar24.github.io/house-cue-prototype/storybook/. A type error stops the deploy.
- Built so far: all 49 HC components and every J1 Homeowner journey step (14 journeys, 106 steps, 92 screens) in mobile and web. J2 Vendor, J3 Support, J4 Admin, J5 Cross-role and Waves W2/W3 outside J1 are not built.

## Commands

```bash
npm run dev                # prototype app on http://localhost:5174 (journey map at /)
npm run build              # type check + production build of the app to dist/
npm run storybook          # Storybook on http://localhost:6008
npm run build-storybook    # static build to storybook-static/
npm run typecheck          # tsc --noEmit
```

Ports 5174 / 6008 are chosen so House Cue can run next to hub360 (5173 / 6007). `.claude/launch.json` defines `app` and `storybook` for the preview pane.

## Structure

- `src/styles/tokens.css` — HouseCue Brand v2 tokens as `--hc-*` CSS variables (names match the Figma variables' code syntax), light + dark (`data-theme="dark"` on `<html>`), and the `.hc-*` text style classes. Values marked `[P]` are proposed in the Brand v2 palette note, not bound variables.
- `src/components/<Name>/` — one HC/* component each: `Name.tsx`, `Name.css`, `Name.stories.tsx`. Cheat sheet: `docs/components.md`.
- `src/app/prototype/` — prototype framework: journeys (`journeys.homeowner.json`, from the J1 page), routing per step (`/homeowner/<journey>/<step>`), `PrototypeContext` (theme, device, screen state from `?theme= ?device= ?state=`), `flow.tsx` (`useFlow()`: goNext / goBack / go(code)), `PrototypeBar` (floating controls), `branchStates.ts` (extra states per screen for the bar's menu), `JourneyMap` (home page).
- `src/app/shells/` — `MobileShell` (status bar, header/app bar, body, tab bar or bottom actions) and `WebShell` (side nav or top bar + content); `navPaths.ts` maps nav items to journey screens.
- `src/app/screens/homeowner/<CODE>-<slug>.tsx` — one screen per Screen Inventory code, found by file name (no registry edits). Rules: `docs/screens.md`.
- `src/app/data/sample.ts` — shared placeholder data (invented names, Phoenix/Tucson addresses).

## Conventions

- Class names use the `hc-` prefix with BEM-style modifiers; screen CSS uses `hc-<code>-`.
- Style with the token variables, not hardcoded colours or sizes. Figma copy verbatim.
- Every component gets a story linked to its Figma node via `design: figma('<node-id>')` (`src/storybook/figma.ts`).
- Run `npm run typecheck` before committing.

## Known gaps

Patterns several screens rebuilt locally that should become shared components: Chip / filter chip, segmented control, Dialog and bottom Sheet, data Table, plain Card, chat composer. Also: TaskRow lacks a neutral tag tone, ListRow is not clickable, ActionCard always shows three buttons, no `mic` icon, MobileShell body gap is fixed at 16px. Many Figma frames still use an older secondary-button / input-label style (light border, muted label) that differs from the current HC/Button and HC/Input specs; the code follows the component specs.
