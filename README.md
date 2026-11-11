# House Cue

A clickable design prototype built from Figma designs, with a Storybook of its components.

Stack: Vite, React 19, TypeScript, React Router, Storybook 10.

## Getting started

```bash
npm install
npm run dev          # prototype app on http://localhost:5174
npm run storybook    # Storybook on http://localhost:6008
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Prototype app with hot reload |
| `npm run build` | Type check + production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run storybook` | Storybook dev server |
| `npm run build-storybook` | Static Storybook to `storybook-static/` |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```
src/
  app/          prototype app (main.tsx entry, App.tsx routes, screens)
  components/   one folder per component: Name.tsx, Name.css, Name.stories.tsx
  styles/       tokens.css (CSS variables, light + dark via data-theme)
.storybook/     Storybook config
public/         static assets (favicon)
```
