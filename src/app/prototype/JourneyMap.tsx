import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo/Logo';
import { getScreen } from '../screens/registry';
import { journeys, roleNames, stepPath, type RoleKey } from './journeys';

/** Prototype home: every journey in workflow order, like the Figma J pages. */
export function JourneyMap() {
  return (
    <main className="hc-proto-map">
      <header className="hc-proto-map__header">
        <Logo />
        <div>
          <h1 className="hc-h2">Prototype</h1>
          <p className="hc-medium hc-muted">
            Pick a journey step. Use the bar at the bottom to step through, switch mobile/web, light/dark and screen state.
          </p>
        </div>
      </header>
      {(Object.keys(journeys) as RoleKey[]).map((role) => (
        <section key={role}>
          <h2 className="hc-h3">{roleNames[role]}</h2>
          <div className="hc-proto-map__grid">
            {journeys[role].map((j) => {
              const built = j.steps.filter((s) => getScreen(role, s.code)).length;
              return (
                <article key={j.slug} className="hc-proto-map__card">
                  <h3 className="hc-large-bold">
                    <Link to={stepPath(role, j.slug, 1)}>{j.name}</Link>
                  </h3>
                  <p className="hc-small hc-muted">
                    {j.workflows} · {built}/{j.steps.length} built
                  </p>
                  <ol>
                    {j.steps.map((s, i) => (
                      <li key={i} className={getScreen(role, s.code) ? '' : 'is-todo'}>
                        <Link to={stepPath(role, j.slug, i + 1)}>
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
