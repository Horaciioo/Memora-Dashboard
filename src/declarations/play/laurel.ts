/**
 * Laurel wreath geometry and unlock stages, drawn on a 120 square
 * @type {Record<string, unknown>}
 */

export const LAUREL = {
  view: 104,
  centre: 52,
  // Portrait radius in drawing units
  face: 33,
  // Stem radius and arc, degrees clockwise from the east
  radius: 39.5,
  arc: { from: 112, to: 224 },
  slots: 15,
  // Last stage index, one stage every ten levels over eight metals
  lastStage: 39,
  // Leaf angle off the stem, outer and inner length ratio
  spread: 22,
  innerRatio: 0.82,
  // Length at full growth, stage where leaves stop growing
  length: { base: 13.5, swell: 5, tip: 14, floor: 0.72, mature: 20 },
  // Leaf shade by position along the branch
  shades: { old: 0.34, mid: 0.7 },
  // First stage wearing each ornament
  from: {
    veins: 4,
    berries: 10,
    sweep: 10,
    halo: 15,
    sway: 20,
    aura: 20,
    gem: 24,
    orbit: 30,
    glow: 32,
    ember: 35,
    stars: 36,
  },
  // Sway strength by first stage
  sway: [
    { from: 35, level: 3 },
    { from: 30, level: 2 },
    { from: 20, level: 1 },
  ],
  // Stem overshoot and tip leaf offset in degrees
  stem: { before: 6, after: 8 },
  tip: { turn: 7, lean: 4 },
  // Berry and glint offsets from a leaf
  berry: { radius: 2.7 },
  glint: { radius: 7, turn: 4, size: 3, every: [3, 2] },
  // Orbit radius and first angle
  orbit: { radius: 50.4, start: -70, size: 1.8 },
  // Orbiting sparkles, count by first stage
  orbits: [
    { from: 35, count: 3 },
    { from: 30, count: 2 },
  ],
  // Rising embers, x and y then delay in seconds
  embers: [
    [6, 96, 0],
    [98, 94, 1.1],
    [5, 84, 2.2],
    [99, 82, 0.6],
    [12, 100, 1.7],
    [92, 100, 2.7],
  ],
  // Corner stars, x and y
  stars: [
    [9, 11],
    [95, 11],
  ],
  size: { ember: 1.4, star: 3.6, glow: 2.8 },
  gem: { path: 'M52 1.5L57.5 8.5L52 16L46.5 8.5Z', y: 8.5 },
  badge: { y: 94.2, radius: 9.2, ring: 1.8 },
  // Delay between neighbouring leaves
  stagger: 0.37,
} as const
