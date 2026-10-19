import { describe, test, expect } from 'vitest';
import { DEMO, OFFICE } from '../config/office.config.js';
import { SAMPLE } from '../config/sample-office.config.js';
import { HOUSE } from '../../docs/house/house-v1.config.js';
import { HOUSE as HOUSE2 } from '../config/house.config.js';
import { validateOfficeConfig } from '../utils/validateOfficeConfig.js';
import { halfExtents, movementVector } from '../utils/geometryUtils.js';
import { tourReducer } from '../utils/tourState.js';
describe('spatial configuration', () => {
  test('replacement house cannot reuse old scan calibration', () => {
    expect(HOUSE2.modelUrl).toBe('/models/house2.glb');
    expect(HOUSE2.doorwayCleanup).toBeNull();
    expect(HOUSE2.colliders.length).toBeGreaterThan(1);
    expect(validateOfficeConfig(HOUSE2)).toEqual([]);
  });
  test('demo spawn is safe, real mode cannot silently use demo coordinates', () => {
    expect(validateOfficeConfig(DEMO)).toEqual([]);
    expect(validateOfficeConfig(SAMPLE)).toEqual([]);
    expect(validateOfficeConfig(HOUSE)).toEqual([]);
    expect(validateOfficeConfig({ ...OFFICE, sceneMode: 'real' })).toEqual(expect.arrayContaining([expect.stringMatching(/spawn/), expect.stringMatching(/MEASURE/)]));
  });
  test('rejects missing model, bad bounds, duplicate IDs and invalid spawn', () => {
    const c = structuredClone(DEMO); c.sceneMode = 'real'; c.player.spawn = [NaN, 0, 0]; c.colliders[0].halfExtents[1] = -1; c.hotspots.push(c.hotspots[0]);
    const result = validateOfficeConfig(c).join(' ');
    expect(result).toMatch(/asset path/); expect(result).toMatch(/Invalid collider/); expect(result).toMatch(/unique/); expect(result).toMatch(/finite/);
  });
  test('rejects a spawn inside furniture', () => {
    const c = structuredClone(DEMO); c.player.spawn = [-3.3, 0.85, -0.25];
    expect(validateOfficeConfig(c).join(' ')).toMatch(/Spawn intersects demo-counter/);
  });
  test('normalizes diagonals and rotates movement with heading', () => {
    const forward = movementVector(0, 1, 0, 2.7), diagonal = movementVector(1, 1, 0, 2.7);
    expect(forward.z).toBeCloseTo(-0.045);
    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(0.045);
    expect(movementVector(0, 1, Math.PI / 2, 2.7).x).toBeCloseTo(-0.045);
    expect(halfExtents([2, 4, 6])).toEqual([1, 2, 3]);
  });
  test('unlock cannot dismiss an info overlay', () => {
    expect(tourReducer('exploring', { type: 'PAUSE' })).toBe('paused');
    expect(tourReducer('info', { type: 'PAUSE' })).toBe('info');
    expect(tourReducer('loading', { type: 'ENTER' })).toBe('loading');
  });
});
