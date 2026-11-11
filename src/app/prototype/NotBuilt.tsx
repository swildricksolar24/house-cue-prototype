import { Button } from '../../components/Button/Button';
import { FIGMA_FILE } from '../../storybook/figma';
import { useFlow } from './flow';

/** Placeholder for a journey step whose screen is not coded yet */
export function NotBuilt() {
  const { step, journey, nextPath, backPath } = useFlow();
  const link = (node?: string) => (node ? `${FIGMA_FILE}?node-id=${node.replace(':', '-')}` : undefined);
  return (
    <div className="hc-proto-notbuilt">
      <p className="hc-small hc-muted">{journey.name}</p>
      <h1 className="hc-h3">
        {step.code} · {step.label}
      </h1>
      <p className="hc-medium hc-muted">This screen is not coded yet.</p>
      <p className="hc-medium">
        {step.mobile && (
          <a className="hc-link" href={link(step.mobile)} target="_blank" rel="noreferrer">
            Mobile frame in Figma
          </a>
        )}
        {step.mobile && step.web && ' · '}
        {step.web && (
          <a className="hc-link" href={link(step.web)} target="_blank" rel="noreferrer">
            Web frame in Figma
          </a>
        )}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        {backPath && (
          <Button variant="secondary" to={backPath}>
            Back
          </Button>
        )}
        {nextPath && <Button to={nextPath}>Next step</Button>}
      </div>
    </div>
  );
}
