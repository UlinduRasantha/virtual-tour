// @vitest-environment node
import { beforeAll, expect, test } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { DEMO } from '../config/office.config.js';
import { SAMPLE } from '../config/sample-office.config.js';
import { HOUSE } from '../../docs/house/house-v1.config.js';
import { HOUSE as HOUSE2 } from '../config/house.config.js';
import { movementVector } from '../utils/geometryUtils.js';
beforeAll(async () => { await RAPIER.init(); });
function walk(start, x, z, steps, config = DEMO) {
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  const fixed = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  for (const c of config.colliders) world.createCollider(RAPIER.ColliderDesc.cuboid(...c.halfExtents).setTranslation(...c.center), fixed);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...start));
  const shape = world.createCollider(RAPIER.ColliderDesc.capsule(config.player.capsuleHalfHeight, config.player.radius), body);
  const controller = world.createCharacterController(0.02); controller.setSlideEnabled(true);
  if (config.player.grounded) { controller.enableAutostep(config.player.stepHeight, 0.05, false); controller.enableSnapToGround(0.3); }
  world.step();
  for (let i = 0; i < steps; i++) {
    const desired = movementVector(x, z, 0, config.player.speed);
    if (config.player.grounded) desired.y = -0.005;
    controller.computeColliderMovement(shape, desired);
    const p = body.translation(), m = controller.computedMovement();
    body.setNextKinematicTranslation({ x: p.x + m.x, y: config.player.grounded ? p.y + m.y : start[1], z: p.z + m.z }); world.step();
  }
  const result = { ...body.translation() }; world.free(); return result;
}
test('walks through the split doorway and stops at the far wall', () => {
  const p = walk([0, 0.85, 4], 0, 1, 400);
  expect(p.z).toBeLessThan(-6.4); expect(p.z).toBeGreaterThan(-6.7); expect(p.y).toBeCloseTo(0.85);
});
test('solid partition and furniture prevent penetration', () => {
  expect(walk([-2, 0.85, -1.3], 0, 1, 200).z).toBeGreaterThan(-1.6);
  expect(walk([-3.3, 0.85, 4], 0, 1, 200).z).toBeGreaterThan(0.6);
  expect(walk([0, 0.85, 4], 1, 0, 250).x).toBeLessThan(5.7);
});
test('sample has a continuous aisle route through its doorway into the vestibule', () => {
  const atLounge = walk(SAMPLE.player.spawn, 0, 1, 400, SAMPLE);
  expect(atLounge.z).toBeLessThan(-5); expect(atLounge.z).toBeGreaterThan(-5.3);
  const atDoor = walk([atLounge.x, atLounge.y, atLounge.z], -1, 0, 180, SAMPLE);
  expect(atDoor.x).toBeCloseTo(-3.9, 1);
  const inside = walk([atDoor.x, atDoor.y, atDoor.z], 0, 1, 140, SAMPLE);
  expect(inside.z).toBeLessThan(-8.2); expect(inside.z).toBeGreaterThan(-8.5);
  const outside = walk([inside.x, inside.y, inside.z], 0, -1, 55, SAMPLE);
  expect(outside.z).toBeGreaterThan(-6);
});
test('sample workbenches, chairs and glazing block the player', () => {
  expect(walk([4.2, 0.85, 0.6], -1, 0, 200, SAMPLE).x).toBeGreaterThan(3.19);
  expect(walk([-4.9, 0.85, 3], -1, 0, 100, SAMPLE).x).toBeGreaterThan(-5.65);
  expect(walk([0.5, 0.85, 2.8], 0, 1, 150, SAMPLE).z).toBeGreaterThan(2.38);
});

test('house doorway supports the threshold in both directions and its wall blocks entry', () => {
  const inside = walk(HOUSE.player.spawn, 0, 1, 80, HOUSE);
  expect(inside.z).toBeLessThan(-1.3);
  expect(inside.y).toBeCloseTo(0.82, 1);
  const outside = walk([inside.x, inside.y, inside.z], 0, -1, 80, HOUSE);
  expect(outside.z).toBeGreaterThan(0.8);
  expect(outside.y).toBeCloseTo(0.62, 1);
  const wall = walk([1.1, HOUSE.player.spawn[1], 1.05], 0, 1, 120, HOUSE);
  expect(wall.z).toBeGreaterThan(0.4);
  const counter = walk([0.1, 0.82, -2], 0, 1, 200, HOUSE);
  expect(counter.z).toBeGreaterThan(-4.8);
});

test('House 2 can walk from its clear spawn and stops at scanned obstacles', () => {
  const moved = walk(HOUSE2.player.spawn, -1, 0, 45, HOUSE2);
  expect(moved.x).toBeLessThan(-2);
  const stopped = walk(HOUSE2.player.spawn, -1, 0, 400, HOUSE2);
  expect(stopped.x).toBeGreaterThan(-7);
  expect(stopped.x).toBeLessThan(-2);
  expect(stopped.y).toBeCloseTo(0.85);
});

test.each([
  ['blue room', [1, 0.85, -2.5], 1, -3.7],
  ['bedroom', [2.4, 0.85, -2.6], -1, -1.1],
  ['right office', [6.4, 0.85, -2.3], -1, -1.0],
  ['garage', [-4.4, 0.85, 1.3], -1, 2.7],
])('House 2 %s doorway is traversable in both directions', (_name, start, forward, beyond) => {
  const inside = walk(start, 0, forward, 55, HOUSE2);
  if (forward > 0) expect(inside.z).toBeLessThan(beyond);
  else expect(inside.z).toBeGreaterThan(beyond);
  const returned = walk([inside.x, inside.y, inside.z], 0, -forward, 55, HOUSE2);
  expect(Math.abs(returned.z - start[2])).toBeLessThan(0.45);
});

test('doorway exceptions do not open the adjacent bedroom wall', () => {
  const stopped = walk([3.4, 0.85, -2.6], 0, -1, 100, HOUSE2);
  expect(stopped.z).toBeLessThan(-2.1);
});
