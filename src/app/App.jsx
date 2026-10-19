import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useGLTF, useProgress } from '@react-three/drei';
import TourCanvas from '../components/scene/TourCanvas.jsx';
import Dialog from '../components/ui/Dialog.jsx';
import TouchControls from '../components/ui/TouchControls.jsx';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';
import { DEMO, OFFICE } from '../config/office.config.js';
import { HOUSE } from '../config/house.config.js';
import { SAMPLE } from '../config/sample-office.config.js';
import { validateOfficeConfig } from '../utils/validateOfficeConfig.js';
import { inspectAsset } from '../utils/inspectAsset.js';
import { tourReducer } from '../utils/tourState.js';

export default function App() {
  const [mode, setMode] = useState(() => {
    const requested = new URLSearchParams(location.search).get('mode');
    return ['demo', 'sample', 'house', 'real'].includes(requested) ? requested : OFFICE.sceneMode === 'real' ? 'real' : 'house';
  });
  const [asset, setAsset] = useState(null), [assetError, setAssetError] = useState(''), [bounds, setBounds] = useState(null);
  const real = mode === 'real';
  const sample = mode === 'sample';
  const house = mode === 'house';
  const config = house ? HOUSE : real ? { ...OFFICE, sceneMode: 'real' } : sample ? SAMPLE : DEMO;
  const modelUrl = config.modelUrl;
  const assetBacked = Boolean(modelUrl);
  const configErrors = validateOfficeConfig(config);
  const inspect = configErrors.length > 0;
  const [state, dispatch] = useReducer(tourReducer, 'loading');
  const [coarse, setCoarse] = useState(() => window.matchMedia?.('(pointer: coarse)').matches || false);
  const [resetVersion, setReset] = useState(0), [retry, setRetry] = useState(0);
  const [lowQuality, setLowQuality] = useState(false), [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const [sceneFailed, setSceneFailed] = useState(false);
  const controls = useRef(), target = useRef(), telemetry = useRef({});
  const touch = useRef({ x: 0, z: 0, lookX: 0, lookY: 0 });
  const { progress } = useProgress();
  const active = state === 'exploring' && !inspect;
  const debug = new URLSearchParams(location.search).get('debug') === 'colliders';
  const ready = useCallback(() => dispatch({ type: 'READY' }), []);
  const lock = useCallback(() => { setNotice(''); dispatch({ type: 'ENTER' }); }, []);
  const unlock = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const leave = useCallback(type => { dispatch({ type }); document.exitPointerLock?.(); touch.current.x = 0; touch.current.z = 0; }, []);
  const welcome = useCallback(() => leave('EXIT'), [leave]);
  const select = useCallback(item => { setSelected(item); leave('INFO'); }, [leave]);
  const changeMode = next => {
    leave('LOAD'); setSceneFailed(false); setAsset(null); setAssetError(''); setBounds(null); setSelected(null); setNotice(''); target.current = null;
    setMode(next); setRetry(v => v + 1);
    const url = new URL(location.href); url.searchParams.set('mode', next); history.replaceState(null, '', url);
  };
  useEffect(() => {
    if (!modelUrl) return;
    const abort = new AbortController();
    inspectAsset(modelUrl, abort.signal).then(setAsset).catch(error => { if (error.name !== 'AbortError') setAssetError(error.message); });
    return () => abort.abort();
  }, [modelUrl, retry]);
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Read-only diagnostics used by browser tests; never enabled in production.
      window.__tour = { snapshot: () => ({ ...telemetry.current, state, mode, target: target.current?.id }) };
      return () => { delete window.__tour; };
    }
  }, [state, mode]);
  const enter = () => {
    if (inspect) return;
    if (coarse) { lock(); return; }
    if (!controls.current) { setNotice('The scene is still initializing. Try again shortly.'); return; }
    try { controls.current.lock(); } catch { setNotice('Mouse capture is unavailable. Use touch / drag controls below.'); }
  };
  useEffect(() => {
    const fail = () => setNotice('Mouse capture was blocked. Open the tour in a browser tab, or use touch / drag controls.');
    const pause = () => { if (document.hidden || !document.hasFocus()) leave('PAUSE'); };
    document.addEventListener('pointerlockerror', fail); document.addEventListener('visibilitychange', pause); window.addEventListener('blur', pause);
    return () => { document.removeEventListener('pointerlockerror', fail); document.removeEventListener('visibilitychange', pause); window.removeEventListener('blur', pause); };
  }, [leave]);
  useEffect(() => {
    const key = e => {
      if (!active || e.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.code === 'Escape') leave('PAUSE');
      if (e.code === 'KeyH' || e.key === '?') leave('HELP');
      if (e.code === 'KeyL') leave('LOCATIONS');
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [active, leave]);
  const reset = () => { setReset(v => v + 1); setNotice(`Returned to the ${house ? 'house' : real ? 'configured' : sample ? 'sample' : 'demo'} entrance.`); };
  const retryScene = () => { if (modelUrl) useGLTF.clear(modelUrl); setSceneFailed(false); setAsset(null); setAssetError(''); dispatch({ type: 'LOAD' }); setRetry(v => v + 1); };
  return <main className={active ? 'app exploring' : 'app'}>
    <div className="scene"><ErrorBoundary key={`${mode}-${retry}`} onRetry={retryScene} onError={() => setSceneFailed(true)}>{(!assetBacked || asset) && <TourCanvas config={config} inspect={inspect} onBounds={setBounds} active={active} coarse={coarse} touch={touch} controls={controls} onLock={lock} onUnlock={unlock} onReady={ready} resetVersion={resetVersion} onSelect={select} targetRef={target} telemetry={telemetry} lowQuality={lowQuality} debug={debug} />}</ErrorBoundary></div>
    <header className="hud" inert={!active} aria-hidden={!active}>
      <div className="brand"><span className="brand-mark">◩</span><div><strong>{house ? 'HOUSE' : 'OFFICE'}<span className="brand-slash"> / </span>EXPLORER</strong><small>VIRTUAL WALKTHROUGH</small></div></div>
      <nav aria-label="Tour controls"><button onClick={() => leave('LOCATIONS')}>Locations</button><button onClick={() => leave('HELP')}>Help <kbd>?</kbd></button><button onClick={reset} aria-label="Reset to entrance">↺ <span>Reset</span></button><button onClick={() => leave('PAUSE')}>Pause</button></nav>
    </header>
    <div className="demo-label"><span /> {house ? (inspect ? 'HOUSE 2 — preview · walkthrough calibration pending' : 'HOUSE 2 — walking demo · provisional scale') : real ? (inspect ? 'REAL ASSET — inspection only / not calibrated' : 'REAL OFFICE — approved scan') : sample ? 'SAMPLE OFFICE — image-inspired demo, not a real scan' : 'DEMO — not your real office'}</div>
    {active && <><div className="crosshair" aria-hidden="true">+</div><div className="bottom-hud"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>Move</span><span className="divider" />Mouse to look <span className="divider" /><kbd>ESC</kbd> Pause <kbd>H</kbd> Help <kbd>L</kbd> Locations</div><span>{house ? 'House scan demo' : real ? 'Office scan' : sample ? 'Image-inspired sample' : 'Demo environment'} <span className="live-dot">●</span></span></div>{coarse && <TouchControls input={touch} onInteract={() => target.current && select(target.current)} />}</>}
    {state === 'loading' && !assetError && !sceneFailed && <Dialog title="Preparing your walkthrough"><p>Loading {house ? 'your house GLB' : real ? 'the approved GLB' : sample ? 'the sample office GLB' : 'the demo environment'} and physics…</p><progress max="100" value={progress || 5} /><p className="muted">First load may take a moment.</p><button onClick={retryScene}>Retry loading</button>{assetBacked && <button onClick={() => changeMode('demo')}>Use labeled demo instead</button>}</Dialog>}
    {assetError && <Dialog title={house ? 'House model could not load' : real ? 'Real office is not ready' : 'Sample office could not load'}><p role="alert">{assetError}</p><p className="muted">No demo geometry has been substituted. Check the asset path and export, then retry.</p><button onClick={retryScene}>Retry GLB</button><button onClick={() => changeMode('demo')}>Use labeled demo instead</button></Dialog>}
    {state === 'welcome' && !inspect && <Dialog title="A space to explore." className="welcome" onEscape={welcome}>
      <div className="eyebrow">INTERACTIVE WALKTHROUGH <span>{house ? 'HOUSE DEMO' : real ? 'REAL OFFICE' : sample ? '02 / SAMPLE' : '01 / DEMO'}</span></div>
      <p className="intro">Step inside. Look around.<br />Explore at your own pace.</p>
      <p className="muted">{house ? 'Walk through House 2 from a clear indoor starting point facing the kitchen. Collision barriers follow the scan and block missing floor areas. Scale is provisional; narrow or damaged passages may remain blocked.' : real ? 'Explore the approved office scan from its calibrated entrance.' : sample ? 'Walk through the office inspired by your reference image. Explore the desks, lounge and open doorway. This is a sample, with assumed dimensions.' : 'You’re entering a demo office. Your real space will appear here once an approved LiDAR scan is ready.'}</p>
      <div className="controls-grid"><div><span className="key-cluster"><kbd>W</kbd><br /><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><strong>Move naturally</strong><small>Walk with your keyboard</small></div><div><span className="control-symbol">↔</span><strong>Take a look</strong><small>Move your mouse to look</small></div><div><span className="control-symbol"><kbd>ESC</kbd></span><strong>Your own pace</strong><small>Pause whenever you like</small></div></div>
      <button className="primary enter" onClick={enter}>Enter {house ? 'House' : real ? 'Office' : sample ? 'Sample Office' : 'Demo Office'} <span>↗</span></button>
      <div className="welcome-links"><button onClick={() => setCoarse(v => !v)}>{coarse ? 'Use keyboard + mouse' : 'Use touch / drag controls'}</button><button onClick={() => changeMode(sample ? 'demo' : 'sample')}>{sample ? 'Switch to simple collision demo' : 'Explore image-inspired sample office'}</button>{!house && <><button onClick={() => changeMode('house')}>Explore house scan demo</button><button onClick={() => leave('SETUP')}>Have your office scan? <span>Set up real office →</span></button></>}</div>
      <div className="welcome-foot"><span>●</span> {house ? 'House 2 · scan-derived collisions · provisional scale' : real ? 'Approved office scan' : sample ? 'Sample environment · assumed dimensions' : 'Awaiting office scan'} <span className="foot-right">DESKTOP + TOUCH</span></div>
    </Dialog>}
    {['paused', 'help'].includes(state) && <Dialog title={state === 'help' ? 'Make yourself at home.' : 'Take a moment.'} onEscape={welcome}><p>{state === 'help' ? 'WASD or arrow keys to walk. Mouse to look. Click a blue marker within 2.5 meters to inspect. Escape pauses.' : 'Your place is saved. Resume whenever you’re ready.'}</p><p className="muted">Touch: drag the left pad to move, the right pad to look, then tap Inspect. {house ? 'House 2 uses a flat walking floor; stairs are not supported.' : 'Flat-floor navigation only.'}</p><button className="primary" onClick={enter}>Resume tour →</button><div className="button-row"><button onClick={reset}>Reset to entrance</button><button onClick={() => leave('HELP')}>Controls</button><button onClick={welcome}>Exit tour</button></div><label className="setting"><input type="checkbox" checked={lowQuality} onChange={e => setLowQuality(e.target.checked)} /> Reduced graphics quality</label></Dialog>}
    {state === 'locations' && <Dialog title={house ? 'House locations' : real ? 'Office locations' : sample ? 'Explore the sample office' : 'Explore the demo'} onEscape={welcome}><p className="muted">Read about locations without moving through the scene.</p>{config.hotspots.map(item => <button className="location-item" key={item.id} onClick={() => select(item)}>{item.title}<span>Read more →</span></button>)}{!config.hotspots.length && <p>No approved location descriptions configured yet.</p>}<button className="primary" onClick={enter}>Resume tour</button></Dialog>}
    {state === 'info' && <Dialog title={selected.title} onEscape={welcome}><div className="eyebrow">{house ? 'HOUSE' : real ? 'OFFICE' : sample ? 'SAMPLE' : 'DEMO'} POINT OF INTEREST</div><p>{selected.description}</p><button className="primary" onClick={enter}>Resume tour</button><button onClick={() => leave('LOCATIONS')}>Back to locations</button></Dialog>}
    {state === 'setup' && <Dialog title="Your real office, next." onEscape={welcome}><p>The demo is separate from real-office mode. Only place a sanitized, approved export in the public folder.</p><p>Add it at <code>public/models/real-office.glb</code>, then measure its spawn, heading and collision proxies in <code>src/config/office.config.js</code>.</p><ul className="setup-list">{validateOfficeConfig({ ...OFFICE, sceneMode: 'real' }).map(e => <li key={e}>{e}</li>)}</ul><button className="primary" onClick={() => changeMode('real')}>Inspect installed GLB →</button><button onClick={welcome}>Back to tour</button></Dialog>}
    {assetBacked && bounds && (inspect || debug) && <aside className="inspector"><strong>{house && inspect ? 'House 2 preview · raw model units / Y-up' : 'GLB inspector · meters / Y-up'}</strong><p>Size X/Y/Z: {bounds.size.map(n => n.toFixed(2)).join(' / ')}</p><p>Min: {bounds.min.map(n => n.toFixed(2)).join(' / ')}<br />Max: {bounds.max.map(n => n.toFixed(2)).join(' / ')}</p><p>{asset?.megabytes} MB · {bounds.meshes} meshes · {bounds.triangles.toLocaleString()} triangles</p><p>{house ? (inspect ? 'Drag to orbit, scroll or pinch to zoom. This is a different house. Entrance, scale and collisions need new calibration; previous doorway edits are disabled.' : 'House 2 uses its original scale provisionally. Collision proxies are derived from scan geometry; no doorway cleanup is applied.') : sample ? 'Generated sample. These dimensions are assumptions, not measurements of a real office.' : 'Verify floor Y=0 and compare a measured wall. Orientation and scale are not automatically certified.'}</p>{inspect && <ul className="setup-list">{configErrors.map(e => <li key={e}>{e}</li>)}</ul>}<button onClick={() => changeMode('demo')}>Back to labeled demo</button></aside>}
    {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
  </main>;
}


