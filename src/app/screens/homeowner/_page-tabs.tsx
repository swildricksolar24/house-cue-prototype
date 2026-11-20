import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

export type PageTab = { id: string; label: string; count?: number; content: ReactNode };

/**
 * Review change: the tab row and tab content on a property's page and a unit's page (styles in C79's CSS). The chosen
 * tab is kept in the address (?tab=), so a reload or Back returns to it; arrow keys move between tabs; the chosen tab's
 * chip fades in and the content fades up.
 */
export function PageTabs({ tabs, label }: { tabs: PageTab[]; label: string }) {
  const [params, setParams] = useSearchParams();
  const tab = tabs.find((t) => t.id === params.get('tab')) ?? tabs[0];
  const pick = (id: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', id);
        return next;
      },
      { replace: true },
    );
  return (
    <>
      <div className="hc-c79-tabs" role="tablist" aria-label={label}>
        {tabs.map((t, i) => {
          const selected = t.id === tab.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`hc-c79-tab-${t.id}`}
              aria-selected={selected}
              aria-controls="hc-c79-tabpanel"
              tabIndex={selected ? 0 : -1}
              className={selected ? 'hc-c79-tab is-selected' : 'hc-c79-tab'}
              onClick={() => pick(t.id)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                e.preventDefault();
                const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
                pick(next.id);
                document.getElementById(`hc-c79-tab-${next.id}`)?.focus();
              }}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && <span className="hc-c79-tab__count">{t.count}</span>}
            </button>
          );
        })}
      </div>
      <div key={tab.id} id="hc-c79-tabpanel" role="tabpanel" aria-labelledby={`hc-c79-tab-${tab.id}`} className="hc-c79-tabpanel">
        {tab.content}
      </div>
    </>
  );
}
