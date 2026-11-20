import { useLayoutEffect, useRef, type ReactNode } from 'react';

/**
 * Review change: content that slides open and closed: its height animates between 0 and the content's height (auto
 * once open, so it can grow), with a fade. Always rendered so closing can animate; inert while closed.
 */
export function Collapse({ id, open, className, children }: { id: string; open: boolean; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const timer = useRef<number | undefined>(undefined);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    window.clearTimeout(timer.current);
    if (first.current) {
      first.current = false;
      el.style.height = open ? 'auto' : '0px';
      return;
    }
    const full = `${el.scrollHeight}px`;
    if (open) {
      el.style.height = '0px';
      void el.offsetHeight;
      el.style.height = full;
      // Once open, let it follow its content (e.g. the Saved line)
      timer.current = window.setTimeout(() => {
        el.style.height = 'auto';
      }, 320);
    } else {
      el.style.height = full;
      void el.offsetHeight;
      el.style.height = '0px';
    }
    return () => window.clearTimeout(timer.current);
  }, [open]);
  return (
    <div id={id} ref={ref} className={[className, open && 'is-open'].filter(Boolean).join(' ')} inert={!open} aria-hidden={!open}>
      {children}
    </div>
  );
}

