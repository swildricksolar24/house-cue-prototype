import { Link } from 'react-router-dom';
import { Button } from '../Button/Button';
import { Logo } from '../Logo/Logo';
import './WebTopBar.css';

export type WebTopBarType = 'onboarding' | 'marketing';
export type WebTopBarKey = 'home' | 'howItWorks' | 'membership' | 'forPros' | 'help' | 'login' | 'getStarted';

/** Default routes for the signed-out web header; override any with `paths`. */
export const webTopBarPaths: Record<WebTopBarKey, string> = {
  home: '/',
  howItWorks: '/how-it-works',
  membership: '/membership',
  forPros: '/for-pros',
  help: '/help',
  login: '/login',
  getStarted: '/get-started',
};

/** Text links per type, in Figma order (the language picker is placed before/after them per type). */
export const webTopBarLinks: Record<WebTopBarType, { key: WebTopBarKey; label: string }[]> = {
  onboarding: [{ key: 'help', label: 'Help' }],
  marketing: [
    { key: 'howItWorks', label: 'How it works' },
    { key: 'membership', label: 'Membership' },
    { key: 'forPros', label: 'For pros' },
    { key: 'help', label: 'Help' },
  ],
};

export type WebTopBarProps = {
  /** Onboarding: logo, language, Help, Log in. Marketing (C39): nav links, language, Log in, Get started. */
  type?: WebTopBarType;
  /** Override routes by key */
  paths?: Partial<Record<WebTopBarKey, string>>;
  /** Language picker label (a ▾ is appended). Default "English" */
  language?: string;
  onLanguageClick?: () => void;
  /** Hide the Log in button (e.g. on the login page) */
  hideLogin?: boolean;
  className?: string;
};

/** HC/Web Top Bar (Figma 5:214) — Type Onboarding / Marketing. Web header for signed-out pages. */
export function WebTopBar({ type = 'onboarding', paths, language = 'English', onLanguageClick, hideLogin = false, className }: WebTopBarProps) {
  const to = { ...webTopBarPaths, ...paths };
  const languagePicker = (
    <button type="button" className="hc-web-top-bar__link" onClick={onLanguageClick} aria-haspopup="listbox">
      {language} <span aria-hidden>▾</span>
    </button>
  );
  const links = webTopBarLinks[type].map((link) => (
    <Link key={link.key} to={to[link.key]} className="hc-web-top-bar__link">
      {link.label}
    </Link>
  ));

  return (
    <header className={['hc-web-top-bar', `hc-web-top-bar--${type}`, className].filter(Boolean).join(' ')}>
      <Link to={to.home} className="hc-web-top-bar__logo" aria-label="HouseCue home">
        <Logo />
      </Link>
      <nav className="hc-web-top-bar__right" aria-label="Site">
        {type === 'onboarding' ? (
          <>
            {languagePicker}
            {links}
          </>
        ) : (
          <>
            {links}
            {languagePicker}
          </>
        )}
        {!hideLogin && (
          <Button variant="secondary" to={to.login}>
            Log in
          </Button>
        )}
        {type === 'marketing' && <Button to={to.getStarted}>Get started</Button>}
      </nav>
    </header>
  );
}
