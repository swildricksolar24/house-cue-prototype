import { Route, Routes } from 'react-router-dom';
import { Button } from '../components/Button/Button';

function Home() {
  return (
    <main style={{ padding: 'var(--space-6)', maxWidth: 720, margin: '0 auto' }}>
      <h1>House Cue</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Design prototype. Screens from Figma go here.</p>
      <Button>Get started</Button>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
