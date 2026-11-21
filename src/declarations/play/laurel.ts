/**
 * Laurel wreath geometry and unlock stages, drawn on a 120 square
 * @type {Record<string, unknown>}
 */

export const LAUREL = {
  view: 120,
  centre: 60,
  // Portrait radius in drawing units
  face: 33,
  // Stem radius and arc, degrees clockwise from the east
  radius: 44,
  arc: { from: 98, to: 228 },
  slots: 15,
  // Last stage index, one stage every ten levels over eight metals
  lastStage: 39,
  // Leaf angle off the stem, outer and inner length ratio
  spread: 27,
  innerRatio: 0.82,
  // Length at full growth, stage where leaves stop growing
  length: { base: 17, swell: 6.5, tip: 18, floor: 0.72, mature: 20 },
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
  glint: { radius: 9, turn: 4, size: 3.6, every: [3, 2] },
  // Orbit radius and first angle
  orbit: { radius: 57, start: -70, size: 4.6 },
  // Orbiting sparkles, count by first stage
  orbits: [
    { from: 35, count: 3 },
    { from: 30, count: 2 },
  ],
  // Rising embers, x and y then delay in seconds
  embers: [
    [14, 96, 0],
    [104, 92, 1.1],
    [22, 70, 2.2],
    [98, 66, 0.6],
    [30, 108, 1.7],
    [92, 110, 2.7],
  ],
  // Corner stars, x and y
  stars: [
    [22, 34],
    [99, 30],
  ],
  size: { ember: 1.7, star: 4.8, glow: 3.4 },
  gem: { path: 'M60 3L67 12L60 22L53 12Z', y: 12 },
  badge: { y: 105, radius: 13, ring: 2.2 },
  // Delay between neighbouring leaves
  stagger: 0.37,
} as const
