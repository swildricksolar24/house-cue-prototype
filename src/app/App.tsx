import { Navigate, Route, Routes } from 'react-router-dom';
import { HomeProvider } from './prototype/HomeContext';
import { JourneyMap } from './prototype/JourneyMap';
import { PrototypeBar } from './prototype/PrototypeBar';
import { PrototypeProvider } from './prototype/PrototypeContext';
import { StepPage } from './prototype/StepPage';
import { userKeys } from './prototype/journeys';

export function App() {
  return (
    <PrototypeProvider>
      <HomeProvider>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <JourneyMap />
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
