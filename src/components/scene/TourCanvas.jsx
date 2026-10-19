import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import DemoOffice from './DemoOffice.jsx';
import OfficeColliders from './OfficeColliders.jsx';
import PlayerController from './PlayerController.jsx';
import Hotspots from './Hotspots.jsx';
import RealOfficeModel from './RealOfficeModel.jsx';
import HouseModel from './HouseModel.jsx';
import { FIXED_STEP } from '../../utils/geometryUtils.js';

function Ready({ onReady }) { useEffect(() => { onReady(); }, [onReady]); return null; }
function MouseControls({ controls, onLock, onUnlock }) {
  const { gl } = useThree();
  return <PointerLockControls ref={controls} domElement={gl.domElement} selector="#pointer-lock-manual-only" minPolarAngle={0.2} maxPolarAngle={Math.PI - 0.2} onLock={onLock} onUnlock={onUnlock} />;
}
function SampleLighting({ lowQuality }) {
  return <>
    <hemisphereLight args={['#eef3f0', '#aaa393', 1.7]} />
    <directionalLight position={[-10, 5, 6]} intensity={3.2} color="#fff1d7" castShadow={!lowQuality}
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-13} shadow-camera-right={13}
      shadow-camera-top={13} shadow-camera-bottom={-13} shadow-camera-far={40} shadow-bias={-0.0003} shadow-normalBias={0.025} />
    <directionalLight position={[4, 2.8, 6]} intensity={0.6} color="#fff9ed" />
  </>;
}
export default function TourCanvas({ config, active, coarse, touch, controls, onLock, onUnlock, onReady, resetVersion, onSelect, targetRef, telemetry, lowQuality, debug, inspect = false, onBounds }) {
  return <Canvas shadows={!lowQuality} dpr={lowQuality ? 1 : [1, 1.5]} camera={{ fov: 70, near: 0.05, far: 150, position: [0, 1.6, 4] }} gl={{ antialias: !lowQuality }} fallback={<p role="alert">WebGL is unavailable. Enable hardware acceleration or use another browser.</p>}>
    <color attach="background" args={['#dce5e6']} />
    {config.sceneMode === 'sample' ? <SampleLighting lowQuality={lowQuality} /> : <hemisphereLight args={config.sceneMode === 'demo' ? ['#eff8ff', '#8b8472', 2] : ['#ffffff', '#ffffff', 1.5]} />}
    {config.sceneMode === 'demo' && <directionalLight position={[3, 7, 4]} intensity={2} castShadow={!lowQuality} shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />}
    <Suspense fallback={null}><Physics gravity={[0, 0, 0]} timeStep={FIXED_STEP} debug={debug}>
      {config.sceneMode === 'house' ? <HouseModel config={config} onBounds={onBounds} inspect={inspect} /> : config.sceneMode === 'demo' ? <DemoOffice config={config} /> : <RealOfficeModel url={config.modelUrl} inspect={inspect} onBounds={onBounds} castShadows={config.sceneMode === 'sample' && !lowQuality} />}
      {!inspect && <><OfficeColliders colliders={config.colliders} />
      <PlayerController config={config} active={active} touch={touch} resetVersion={resetVersion} telemetry={telemetry} />
      <Hotspots items={config.hotspots} active={active} onSelect={onSelect} targetRef={targetRef} /></>}
      {debug && <><axesHelper args={[2]} /><gridHelper args={[20, 20, '#38bdf8', '#64748b']} /></>}
      <Ready onReady={onReady} />
    </Physics></Suspense>
    {!coarse && !inspect && <MouseControls controls={controls} onLock={onLock} onUnlock={onUnlock} />}
    {inspect && config.sceneMode === 'house' && <OrbitControls makeDefault />}
  </Canvas>;
}
