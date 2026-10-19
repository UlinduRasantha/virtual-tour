import asset from '../../docs/sample-office/office.config.json';
import { sampleHotspots } from '../data/hotspots.js';

// These generated coordinates belong only to office.glb, not a real scanned office.
export const SAMPLE = {
  title: 'Sample Office', sceneMode: 'sample', modelUrl: asset.modelUrl, unit: 'meters',
  player: asset.suggestedSamplePlayer,
  colliders: asset.colliders,
  hotspots: sampleHotspots, rooms: [], floorplan: null,
};
