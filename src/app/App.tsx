import { Navigate, Route, Routes } from 'react-router-dom';
import { JourneyMap } from './prototype/JourneyMap';
import { PrototypeBar } from './prototype/PrototypeBar';
import { PrototypeProvider } from './prototype/PrototypeContext';
import { StepPage } from './prototype/StepPage';

export function App() {
  return (
    <PrototypeProvider>
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
        <Route path="/homeowner/:journey/:step" element={<StepPage role="homeowner" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PrototypeProvider>
  );
}
