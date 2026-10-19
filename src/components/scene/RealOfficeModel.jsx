import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
export default function RealOfficeModel({ url, inspect, onBounds, castShadows = false }) {
  const { scene } = useGLTF(url, false, false); // Cached; no external or unverified decoders.
  const { camera } = useThree();
  useEffect(() => {
    scene.traverse(object => {
      if (object.isMesh) { object.castShadow = castShadows && !object.material.transparent; object.receiveShadow = castShadows; }
    });
  }, [scene, castShadows]);
  const stats = useMemo(() => {
    const box = new Box3().setFromObject(scene), size = box.getSize(new Vector3());
    if (box.isEmpty() || !size.toArray().every(Number.isFinite)) throw new Error('The GLB has no visible mesh bounds. Export a mesh, not only a point cloud or splat.');
    let triangles = 0, meshes = 0;
    scene.traverse(object => { if (object.isMesh) { meshes++; triangles += (object.geometry.index?.count || object.geometry.attributes.position?.count || 0) / 3; } });
    return { min: box.min.toArray(), max: box.max.toArray(), size: size.toArray(), center: box.getCenter(new Vector3()).toArray(), meshes, triangles: Math.round(triangles) };
  }, [scene]);
  useEffect(() => {
    onBounds(stats);
    if (inspect) {
      // Bounds-derived inspection viewpoint, never a claimed visitor entrance.
      const distance = Math.max(...stats.size) * 1.5;
      camera.position.set(stats.center[0] + distance, stats.center[1] + distance * 0.6, stats.center[2] + distance);
      camera.lookAt(...stats.center);
      camera.far = Math.max(150, distance * 5); camera.updateProjectionMatrix();
    }
  }, [stats, onBounds, inspect, camera]);
  return <primitive object={scene} dispose={null} />;
}
