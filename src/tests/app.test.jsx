import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { test, expect, vi, afterEach, beforeEach } from 'vitest';
import App from '../app/App.jsx';
vi.mock('@react-three/drei', () => ({ useProgress: () => ({ progress: 100 }), useGLTF: { clear: vi.fn() } }));
vi.mock('../utils/inspectAsset.js', () => ({ inspectAsset: vi.fn().mockResolvedValue({ bytes: 4065876, megabytes: '3.88' }) }));
vi.mock('../components/scene/TourCanvas.jsx', async () => {
  const { useEffect } = await import('react');
  return { default: function MockCanvas({ onReady }) { useEffect(onReady, [onReady]); return <div>Scene mock</div>; } };
});
afterEach(cleanup);
beforeEach(() => history.replaceState(null, '', '/?mode=demo'));
test('labels demo, offers entry and a separate real setup', () => {
  render(<App />);
  expect(screen.getByText('DEMO — not your real office')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enter Demo Office/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Set up real office/ }));
  expect(screen.getByText(/MEASURE\/VERIFY/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Inspect installed GLB/ })).toBeInTheDocument();
});
test('touch entry, pause, locations and resume have explicit states', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Use touch/ }));
  fireEvent.click(screen.getByRole('button', { name: /Enter Demo Office/ }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Locations' }));
  fireEvent.click(screen.getByRole('button', { name: /Demo reception counter/ }));
  expect(screen.getByText(/procedural test object/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Resume tour' }));
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  expect(screen.getByRole('heading', { name: 'Take a moment.' })).toBeInTheDocument();
});
test('sample mode opens the sample GLB and its own locations without real-office claims', async () => {
  history.replaceState(null, '', '/?mode=sample');
  render(<App />);
  expect(await screen.findByRole('button', { name: /Enter Sample Office/ })).toBeInTheDocument();
  expect(screen.getByText('SAMPLE OFFICE — image-inspired demo, not a real scan')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Use touch/ }));
  fireEvent.click(screen.getByRole('button', { name: /Enter Sample Office/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Locations' }));
  fireEvent.click(screen.getByRole('button', { name: /Open doorway/ }));
  expect(screen.getByText(/short vestibule/)).toBeInTheDocument();
  expect(screen.queryByText('DEMO POINT OF INTEREST')).not.toBeInTheDocument();
});
