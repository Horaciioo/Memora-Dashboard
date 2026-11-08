/**
 * Ground, cup and light of the 3D course, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE_COURSE = {
  // Pit drawn from the physics cup: points, darkening of funnel and wall
  cup: { segments: 28, shade: { funnel: 0.3, wall: 0.65 } },
  // Balls resting in the cup, stacked while the hole waits on the rest
  stack: { gap: 0.09, jitter: 0.035, popMs: 320 },
  pole: { radius: 0.018, segments: 8 },
  // Glass walls: opacity
  glass: { opacity: 0.28 },
  // Points badge: canvas edge, ring, size, lift over the flag, paint key by points
  points: {
    pixels: 128,
    ring: 8,
    size: 0.7,
    lift: 0.5,
    tints: ['shade', 'boost', 'orb-deep', 'bad'] as const,
  },
  flag: { width: 0.42, height: 0.28, drop: 0.16, sway: 0.25, swaySpeed: 2.4, knob: 0.04 },
  // Chevrons scroll along the push: tiles across the plate, tiles per second, inner share
  chevron: { size: 1.1, lift: 0.01, tiles: 2, speed: 0.8, inner: 0.82 },
  // Height lines on slopes: metres between lines, darkening, slope shading
  contour: { step: 0.08, line: 0.14, shade: 0.9 },
  // Boost slab lit by a ball: pulse ms, wait between the two chevrons, size gain, lift
  boost: { pulseMs: 600, waitMs: 130, pop: 0.14, rise: 0.03 },
  // Sink and opacity, wave scale and speed, crest cut, deep and foam widths, glints per metre
  water: {
    sink: 0.04,
    opacity: 0.86,
    wave: { x: 2.6, z: 3.1, diagonal: 1.9, speed: 0.9, crest: 0.95 },
    deep: { reach: 1.4, shade: 0.4 },
    foam: { width: 0.1, wobble: 0.04, ripple: 9, speed: 2 },
    glint: { density: 9, chance: 0.995, rate: 2 },
    crest: 0.3,
  },
  // Sand grain: texture cells, metres per cell, darkest tone, fleck share, dune band rows
  sand: {
    cells: 64,
    cell: 0.07,
    dark: 0.84,
    flecks: 0.12,
    band: { every: 9, wave: 2.5, tone: 0.94 },
  },
  // Cubic colour patches on the walls: texture cells, metres per cell, darkest tone, big patches
  patch: { cells: 32, cell: 0.5, dark: 0.82, big: { count: 16, min: 4, max: 9, dark: 0.88 } },
  // Thin block under the course: the wall is the slab's own edge, no cliff below
  island: { depth: 5 },
  roughness: { turf: 0.95, ice: 0.15, surface: 0.9, side: 1, rail: 0.7, block: 0.8 },
  // Debug wireframes: lift, circle points, query flag
  hitbox: { lift: 0.01, segments: 32, query: 'hitboxes' },
  light: { hemisphere: 1.6, sun: 1.6 },
  fog: { near: 30, far: 90 },
  sun: { offset: [5, 12, 3] as const, map: 2048, margin: 2, bias: -0.0004, normalBias: 0.02 },
} as const
