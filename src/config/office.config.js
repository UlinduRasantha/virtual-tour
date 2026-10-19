import { demoHotspots, realHotspots } from '../data/hotspots.js';

const box = (id, center, size, color) => ({ id, type: 'box', center, halfExtents: size.map(n => n / 2), color });
// These coordinates describe ONLY the procedural demo. Never copy them into real mode.
export const DEMO = {
  title: 'Demo Office', sceneMode: 'demo', unit: 'meters',
  player: { spawn: [0, 0.85, 4], initialYaw: 0, eyeOffsetY: 0.75, radius: 0.3, capsuleHalfHeight: 0.5, speed: 2.7 },
  colliders: [
    box('floor', [0, -0.1, 0], [12, 0.2, 14], '#c9c5b9'),
    box('west-wall', [-6, 1.6, 0], [0.2, 3.2, 14], '#e3e5df'),
    box('east-wall', [6, 1.6, 0], [0.2, 3.2, 14], '#d9ddd9'),
    box('north-wall', [0, 1.6, -7], [12, 3.2, 0.2], '#c4cec8'),
    box('south-wall', [0, 1.6, 7], [12, 3.2, 0.2], '#e3e5df'),
    box('door-left', [-3.5, 1.6, -2], [5, 3.2, 0.2], '#c3cfc8'),
    box('door-right', [3.5, 1.6, -2], [5, 3.2, 0.2], '#c3cfc8'),
    box('door-lintel', [0, 2.9, -2], [2, 0.6, 0.2], '#c3cfc8'),
    box('demo-counter', [-3.3, 0.55, -0.25], [3.3, 1.1, 1.15], '#8d6d50'),
    box('demo-bench', [4.6, 0.4, 2.3], [1.2, 0.8, 3], '#647b75'),
    box('demo-table', [3.3, 0.4, -4.6], [2.1, 0.8, 1.5], '#987b5e'),
  ],
  hotspots: demoHotspots, rooms: [], floorplan: null,
};

export const OFFICE = {
  title: 'Office Virtual Tour', sceneMode: 'demo', modelUrl: '/models/real-office.glb', unit: 'meters',
  approved: false, calibrated: false,
  // TODO: MEASURE/VERIFY against the approved GLB. Spawn is capsule center, yaw is radians.
  player: { spawn: null, initialYaw: null, eyeOffsetY: 0.75, radius: 0.3, capsuleHalfHeight: 0.5, speed: 2.7 },
  colliders: [], rooms: [], hotspots: realHotspots, floorplan: null,
};
