import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FIGMA_FILE } from '../../storybook/figma';
import { branchStates } from './branchStates';
import { useOptionalFlow } from './flow';
import { usePrototype, type DeviceSetting } from './PrototypeContext';

/**
 * Floating prototype controls (not part of the HouseCue design): step back/next, theme, device, screen state,
 * a link to the step's Figma frame and the journey map. Press "." to hide/show; ←/→ step through the journey.
 */
export function PrototypeBar() {
  const { theme, setTheme, deviceSetting, setDevice, device, screenState } = usePrototype();
  const [params, setParams] = useSearchParams();
  const flow = useOptionalFlow();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === '.') setHidden((h) => !h);
      if (e.altKey && e.key === 'ArrowRight' && flow?.nextPath) navigate(flow.nextPath);
      if (e.altKey && e.key === 'ArrowLeft' && flow?.backPath) navigate(flow.backPath);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flow, navigate]);

  if (hidden) {
    return (
      <button className="hc-proto-bar__reveal" onClick={() => setHidden(false)} aria-label="Show prototype controls">
        ⋯
      </button>
    );
  }

  const node = flow ? (device === 'mobile' ? flow.step.mobile : flow.step.web) ?? flow.step.mobile : undefined;

  // State menu: the four standard states plus this screen's branch states (?state= or ?view=)
  const branches = [...(flow ? branchStates[flow.step.code] ?? [] : [])];
  const view = params.get('view');
  const stateValue = view ? `view:${view}` : `state:${screenState}`;
  const known = stateValue === 'state:default' || ['empty', 'loading', 'error'].includes(screenState) || branches.some((b) => `${b.param}:${b.value}` === stateValue);
  const pickState = (v: string) => {
    const [param, value] = v.split(':');
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        n.delete('state');
        n.delete('view');
        if (value !== 'default') n.set(param, value);
        return n;
      },
      { replace: true },
    );
  };
  if (!known) branches.push({ param: view ? 'view' : 'state', value: view ?? screenState, label: view ?? screenState });

  return (
    <div className="hc-proto-bar" role="toolbar" aria-label="Prototype controls">
      <Link className="hc-proto-bar__btn" to="/" title="Journey map">
        ☰
      </Link>
      {flow && (
        <>
          <button className="hc-proto-bar__btn" disabled={!flow.backPath} onClick={flow.goBack} title="Previous step (Alt+←)">
            ‹
          </button>
          <span className="hc-proto-bar__step" title={flow.journey.name}>
            <b>{flow.step.code}</b> {flow.step.label}
            <span className="hc-proto-bar__count">
              {flow.index + 1}/{flow.journey.steps.length}
            </span>
          </span>
          <button className="hc-proto-bar__btn" disabled={!flow.nextPath} onClick={flow.goNext} title="Next step (Alt+→)">
            ›
          </button>
        </>
      )}
      <select aria-label="Device" value={deviceSetting} onChange={(e) => setDevice(e.target.value as DeviceSetting)}>
        <option value="auto">Auto ({device})</option>
        <option value="mobile">Mobile 390</option>
        <option value="web">Web 1440</option>
      </select>
      <select aria-label="Screen state" value={stateValue} onChange={(e) => pickState(e.target.value)}>
        <option value="state:default">Default</option>
        <option value="state:empty">Empty</option>
        <option value="state:loading">Loading</option>
        <option value="state:error">Error</option>
        {branches.length > 0 && (
          <optgroup label="Branches">
            {branches.map((b) => (
              <option key={`${b.param}:${b.value}`} value={`${b.param}:${b.value}`}>
                {b.label}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <button className="hc-proto-bar__btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Light / dark">
        {theme === 'light' ? '☾' : '☀'}
      </button>
      {node && (
        <a className="hc-proto-bar__btn" href={`${FIGMA_FILE}?node-id=${node.replace(':', '-')}`} target="_blank" rel="noreferrer" title="Open this frame in Figma">
          F
        </a>
      )}
      <button className="hc-proto-bar__btn" onClick={() => setHidden(true)} title="Hide (.)">
        ×
      </button>
    </div>
  );
}
