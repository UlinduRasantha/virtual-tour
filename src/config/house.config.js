import scan from '../../docs/house/house2-colliders.json';
// Source floor confirmed by downward rays at (0,0) and (-1,0).
// Raw units are provisionally meters; no previous-house calibration is reused.
export const HOUSE = {
  title: 'House 2 walkthrough', sceneMode: 'house', unit: 'meters', modelUrl: '/models/house2.glb',
  inspectionOnly: false,
  transform: { scale: 1, origin: [0, scan.floorY, 0] },
  doorwayCleanup: null,
  player: { spawn: [-1, 0.85, 0], initialYaw: Math.PI / 2, eyeOffsetY: 0.75, radius: 0.22, capsuleHalfHeight: 0.58, speed: 2.2 },
  colliders: scan.colliders, hotspots: [], rooms: [], floorplan: null,
};
