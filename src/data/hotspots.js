export const realHotspots = []; // TODO: MEASURE/VERIFY and obtain approved descriptions.
export const sampleHotspots = [
  { id: 'sample-workbenches', title: 'Shared workbenches', position: [3.05, 1.3, 0.6], maxInteractDistance: 2.5,
    description: 'Timber desktops, black steel frames and curved chairs are modeled from the reference image. This is an image-inspired sample with assumed dimensions. Desks and chairs have collision proxies; use the open aisle to walk around them.' },
  { id: 'sample-window-worktop', title: 'Window worktop', position: [-3.95, 1.3, 0.2], maxInteractDistance: 2.5,
    description: 'The tall windows, horizontal blinds and slim worktop echo the reference image. Glazing blocks movement. The trees outside are stylized sample scenery, not a reconstruction of a real location.' },
  { id: 'sample-doorway', title: 'Open doorway', position: [-3.9, 1.6, -7.35], maxInteractDistance: 2.5,
    description: 'Walk through this open doorway into the short vestibule. Its frame has separate side and top colliders, leaving the opening clear. This doorway is an assumed part of the sample layout.' },
  { id: 'sample-lounge', title: 'Lounge corner', position: [3.2, 1.3, -5.5], maxInteractDistance: 2.5,
    description: 'Muted green and ochre seats, shelving and plants complete the sample office. Furniture blocks the walking path. All of this content describes the generated sample, not your actual office.' },
];
export const demoHotspots = [{
  id: 'demo-counter-info', title: 'Demo reception counter', position: [-3.3, 1.5, 0.4], maxInteractDistance: 2.5,
  description: 'This is a procedural test object, not your office. Walk toward it to test furniture collision. The open doorway leads to a second test area. Your approved LiDAR scan will replace this entire environment.',
}];
