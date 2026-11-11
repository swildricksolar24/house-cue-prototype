import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getScreen } from '../screens/registry';
import { DeviceFrame } from './DeviceFrame';
import { FlowProvider, useFlow } from './flow';
import { findJourney, type RoleKey } from './journeys';
import { NotBuilt } from './NotBuilt';
import { PrototypeBar } from './PrototypeBar';

/** /:role/:journey/:step — renders one journey step inside the device frame */
export function StepPage({ role }: { role: RoleKey }) {
  const { journey: slug, step } = useParams();
  const journey = findJourney(role, slug);
  const index = Number(step) - 1;
  if (!journey || !(index >= 0 && index < journey.steps.length)) return <Navigate to="/" replace />;

  return (
    <FlowProvider role={role} journey={journey} index={index}>
      <DeviceFrame>
        <Step />
      </DeviceFrame>
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
