import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { Logo } from '../../components/Logo/Logo';
import { StatusPill } from '../../components/StatusPill/StatusPill';
import { FIGMA_FILE } from '../../storybook/figma';
import { userTypes } from './users';
import { getScreen } from '../screens/registry';
import { journeys, roleNames, stepPath, type RoleKey } from './journeys';

const SHOW_JOURNEY_LISTS = false;

/** Prototype home: the user types, and (when shown) every journey in workflow order, like the Figma J pages. */
export function JourneyMap() {
  return (
    <main className="hc-proto-map">
      <header className="hc-proto-map__header">
        <Logo />
      </header>
      <section>
        {/* The page's main heading now that the "Prototype" title is gone */}
        <h1 className="hc-h3">Who uses HouseCue</h1>
        <p className="hc-medium hc-muted">Six kinds of user across the mobile app, the web app and two staff consoles.</p>
        <div className="hc-proto-map__users">
          {userTypes.map((u) => (
            <article key={u.id} className="hc-proto-map__user">
              <div className="hc-proto-map__user-head">
                <span className="hc-proto-map__user-icon">
                  <Icon name={u.icon} />
                </span>
                <h3 className="hc-large-bold">{u.name}</h3>
                <StatusPill label={u.start ? 'Built' : 'Not built yet'} tone={u.start ? 'success' : 'neutral'} />
              </div>
              <p className="hc-medium">{u.summary}</p>
              {u.includes && <p className="hc-small hc-muted">{u.includes}</p>}
              <p className="hc-small hc-muted">{u.surfaces}</p>
              <div className="hc-proto-map__user-links">
                {u.start && <Button to={u.start}>Start the journey</Button>}
                <Button variant="secondary" href={`${FIGMA_FILE}?node-id=${u.figma.node.replace(':', '-')}`}>
                  View in Figma
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
      {/* Journey step lists are hidden; set SHOW_JOURNEY_LISTS to true to bring them back */}
      {SHOW_JOURNEY_LISTS && (Object.keys(journeys) as RoleKey[]).map((role) => (
        <section key={role}>
          <h2 className="hc-h3">{roleNames[role]}</h2>
          <div className="hc-proto-map__grid">
            {journeys[role].map((j) => {
              const built = j.steps.filter((s) => getScreen(role, s.code)).length;
              return (
                <article key={j.slug} className="hc-proto-map__card">
                  <h3 className="hc-large-bold">
                    <Link to={stepPath(j.slug, 1)}>{j.name}</Link>
                  </h3>
                  <p className="hc-small hc-muted">
                    {j.workflows} · {built}/{j.steps.length} built
                  </p>
                  <ol>
                    {j.steps.map((s, i) => (
                      <li key={i} className={getScreen(role, s.code) ? '' : 'is-todo'}>
                        <Link to={stepPath(j.slug, i + 1)}>
                          <b>{s.code}</b> {s.label}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
