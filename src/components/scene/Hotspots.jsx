import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';
export default function Hotspots({ items, active, onSelect, targetRef }) {
  const { camera, scene, gl } = useThree();
  const ray = useMemo(() => new Raycaster(), []);
  const tick = useRef(0);
  useFrame((_, delta) => {
    tick.current += delta;
    if (tick.current < 0.1) return;
    tick.current = 0;
    targetRef.current = null;
    if (!active) return;
    ray.setFromCamera(new Vector2(0, 0), camera);
    // First visible surface wins: a wall blocks a hotspot even inside interaction range.
    const first = ray.intersectObjects(scene.children, true).find(hit => hit.object.isMesh && !hit.object.userData.debug);
    if (first?.object.userData.hotspot && first.distance <= first.object.userData.hotspot.maxInteractDistance) targetRef.current = first.object.userData.hotspot;
  });
  useEffect(() => {
    const click = () => { if (active && targetRef.current) onSelect(targetRef.current); };
    gl.domElement.addEventListener('click', click);
    return () => gl.domElement.removeEventListener('click', click);
  }, [active, gl, onSelect, targetRef]);
  return items.map(h => <mesh key={h.id} position={h.position} userData={{ hotspot: h }}><sphereGeometry args={[0.12, 16, 12]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.7} /></mesh>);
}
