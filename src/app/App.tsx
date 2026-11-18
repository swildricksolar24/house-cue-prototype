import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DemoProvider } from './prototype/DemoTools';
import { DeviceFrame } from './prototype/DeviceFrame';
import { HomeProvider } from './prototype/HomeContext';
import { ChooseAccount } from './screens/homeowner/_choose-account';
import { JourneyMap } from './prototype/JourneyMap';
import { PrototypeBar } from './prototype/PrototypeBar';
import { PrototypeProvider } from './prototype/PrototypeContext';
import { StepPage } from './prototype/StepPage';
import { stepPath, userKeys } from './prototype/journeys';

/** / → the landing page, keeping the query (?bar=1, ?theme=, ?device=) */
function ToLanding() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: stepPath('onboarding', 1, 'homeowner'), search }} replace />;
}

export function App() {
  return (
    <PrototypeProvider>
      <HomeProvider>
      <Routes>
        {/* Review change: the site starts on the landing page (C39, homeowner onboarding step 1). The six-users page
            ("Who uses HouseCue") moved to /journeys, reached from the prototype bar's ☰ button. */}
        <Route path="/" element={<ToLanding />} />
        <Route
          path="/journeys"
          element={
            <>
              <JourneyMap />
              <PrototypeBar />
            </>
          }
        />
        {/* Review change: Choose an account, after accepting an invite and signing in (and Switch account) */}
        <Route
          path="/accounts"
          element={
            <>
              <DemoProvider>
                <DeviceFrame>
                  <ChooseAccount />
                </DeviceFrame>
              </DemoProvider>
              <PrototypeBar />
            </>
          }
        />
        {userKeys.map((user) => (
          <Route key={user} path={`/${user}/:journey/:step`} element={<StepPage role="homeowner" user={user} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </HomeProvider>
    </PrototypeProvider>
  );
}
