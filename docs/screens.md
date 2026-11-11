# Building screens

How a Figma screen becomes a prototype screen. Read with `CLAUDE.md`.

## Where screens come from

The Figma file "Claude — House Cue" (`6kMDFUNggxvrwZN0ccl7FG`) draws every screen on batch pages (B1–B16, W2, W3) and lays them out in workflow order on journey pages (J1 Homeowner, J2 Vendor, J3 Support, J4 Admin, J5 Cross-role). Each screen has four frames — Mobile/Light, Mobile/Dark, Web/Light, Web/Dark — plus a note card and, for list screens, Empty / Loading / Error state frames. Dark frames only swap tokens, so code from the light frames.

`src/app/prototype/journeys.homeowner.json` lists every J1 step with its screen code, label and the Figma node of its mobile and web instance. Build from those nodes (`get_design_context` on the mobile node and on the web node).

## Files

- One file per screen code: `src/app/screens/<role>/<CODE>-<slug>.tsx` with a **default export**, e.g. `homeowner/C08-home-dashboard.tsx`. The registry finds it by file name; no other file needs editing.
- A screen reused in several journeys (C18, C20, C12, C13, C41, C04, C15, C91 …) is still one file. It receives `variant` (the journey step label, e.g. `"Job tracker (tenant, status only)"`) and switches on it.
- Screen-only CSS goes next to it as `<CODE>-<slug>.css` with classes prefixed `hc-<code>-` (e.g. `hc-c08-`). Prefer composing components over new CSS.
- Shared sample records live in `src/app/data/sample.ts` (home, systems, tasks, vendors). Data only one screen uses stays in that screen file. Do not edit `sample.ts` from parallel work; add local data instead.

## Anatomy

```tsx
import type { ScreenProps } from '../registry';
import { usePrototype } from '../../prototype/PrototypeContext';
import { useFlow } from '../../prototype/flow';

export default function HomeDashboard({ variant }: ScreenProps) {
  const { device, screenState } = usePrototype(); // device: 'mobile' | 'web'; screenState: 'default' | 'empty' | 'loading' | 'error'
  const flow = useFlow(); // flow.goNext(), flow.goBack(), flow.go('C14'), flow.nextPath
  return device === 'mobile' ? <MobileShell …>…</MobileShell> : <WebShell …>…</WebShell>;
}
```

- **Mobile and web are two layouts of one screen.** Wrap the page in the shell that matches the Figma frame (see `src/app/shells/`): `MobileShell` (status bar, header or app bar, scrolling body, optional tab bar or bottom actions) and `WebShell` (248px side nav + content, or the onboarding/marketing top bar). Share the content pieces between both layouts; only the arrangement differs.
- **Navigation:** the primary CTA calls `flow.goNext()`. Back arrows call `flow.goBack()`. Links to another screen use `flow.go('<code>')`. Tab bar and side nav items link to their screens through the shells.
- **States:** if Figma draws Empty / Loading / Error frames for the screen (they sit next to it on its batch page), render them when `screenState` is set — use `StateBlock` and `SkeletonCard`. Branch frames on the J page (e.g. "Branch: No quotes") are states too: expose them through `screenState` or local UI state, whichever the flow needs.
- **Interactive:** inputs accept typing, toggles toggle, tabs switch, sheets open and close. Nothing posts anywhere; keep state in the component.
- **Components first:** use the HC components in `src/components/` (Button, Input, Select, Checkbox, Radio, Switch, Banner, StatusPill, ListRow, DetailRow, TaskRow, OptionCard, AgentCard, QuoteRow, TimelineStep, CreditsMeter, …). Do not restyle them per screen. If a screen needs something the library lacks and it appears on more than one screen, report it instead of building it inline.
- **Tokens only:** colours, spacing, radius via `var(--hc-*)`; text via `.hc-h1…h4`, `.hc-large-bold`, `.hc-large`, `.hc-medium-semibold`, `.hc-medium`, `.hc-small`, `.hc-muted`, `.hc-link`.
- **Copy:** use the Figma copy verbatim. Note cards on the batch pages are designer notes, not UI.

## Done means

1. `npx tsc --noEmit` passes.
2. The step renders at `http://localhost:5174/homeowner/<journey>/<step>?device=mobile` and `?device=web`, and matches `get_screenshot` of the mobile and web nodes side by side.
3. Dark mode (toolbar ☾) has no hardcoded colours showing.
4. The primary CTA moves to the next step.
