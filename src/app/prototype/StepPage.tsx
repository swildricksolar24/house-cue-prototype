import { Suspense } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { getScreen } from '../screens/registry';
import { DemoProvider } from './DemoTools';
import { DeviceFrame } from './DeviceFrame';
import { FlowProvider, useFlow } from './flow';
import { journeyFromUrl, setActiveUser, stepPath, type RoleKey, type UserKey } from './journeys';
import { NotBuilt } from './NotBuilt';
import { PrototypeBar } from './PrototypeBar';

/** /:user/:journey/:step — renders one journey step inside the device frame. The user (homeowner, landlord, tenant) is in the URL. */
export function StepPage({ role, user }: { role: RoleKey; user: UserKey }) {
  const { journey: slug, step } = useParams();
  const { search } = useLocation();
  const { journey, redirect } = journeyFromUrl(user, slug);
  const index = Number(step) - 1;
  if (!journey || !(index >= 0 && index < journey.steps.length)) return <Navigate to="/" replace />;
  // Old or mismatched links (e.g. /homeowner/landlord-portfolio/2) go to the owner's address
  if (redirect) return <Navigate to={{ pathname: stepPath(journey.slug, index + 1, user), search }} replace />;
  // Links built while this step renders keep this user in the URL
  setActiveUser(user);

  return (
    <FlowProvider role={role} journey={journey} index={index}>
      <DemoProvider>
        <DeviceFrame>
          <Step />
        </DeviceFrame>
      </DemoProvider>
      <PrototypeBar />
    </FlowProvider>
  );
}

function Step() {
  const { role, step } = useFlow();
  const Screen = getScreen(role, step.code);
  if (!Screen) return <NotBuilt />;
  return (
    <Suspense fallback={null}>
      <Screen key={`${step.code}-${step.label}`} variant={step.label} />
    </Suspense>
  );
}
