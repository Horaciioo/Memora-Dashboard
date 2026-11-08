/**
 * Obstacles of the 3D course, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE_OBSTACLES = {
  bumper: {
    segments: 32,
    // Hit bounce: ms, size gain, squash share, half turns, glow
    pulseMs: 450,
    pulse: 0.3,
    squash: 0.55,
    bounces: 2.5,
    glow: 1.1,
    roughness: 0.35,
    // Profiles as radius then height factors: white plate, straight puck with a bevel and a sunk tray
    skin: {
      plate: [
        [0, 0],
        [1.06, 0],
        [1.08, 0.06],
        [1.02, 0.1],
        [0, 0.1],
      ],
      puck: [
        [0, 0.1],
        [1, 0.1],
        [1, 0.82],
        [0.97, 0.9],
        [0.86, 0.92],
        [0.82, 0.86],
        [0, 0.86],
      ],
      // Domed cap of a course bumper, a tapered drum under a rounded crown
      dome: [
        [0, 0.1],
        [1, 0.1],
        [0.98, 0.5],
        [0.9, 0.66],
        [0.76, 0.8],
        [0.56, 0.92],
        [0.3, 0.98],
        [0, 1],
      ],
      // Bounce band round the side, tray rim and avatar disc
      ring: { across: 1, up: 0.5, tube: 0.05 },
      tray: { inner: 0.8, outer: 0.88, up: 0.87, avatar: 0.78, lift: 0.005 },
    },
    // Rise out of the ground: ms and overshoot
    riseMs: 380,
    riseOvershoot: 1.4,
    // Hearts under it, pixels below the foot
    heartsDrop: 0.05,
    // Floor samples round the foot, to stand on the lowest
    foot: { samples: 8 },
  },
  // Rail: rounded cap tone toward the cloud, points per round
  rail: { cap: 0.35, segments: 12 },
  // Dark band at a cliff foot and along an open edge, light rim around sand: width, tone, opacity
  edge: {
    lift: 0.006,
    step: 0.05,
    cliff: { width: 0.22, shade: 0.75, opacity: 0.45 },
    open: { width: 0.16, shade: 0.85, opacity: 0.6 },
    sand: { width: 0.05, shade: 0.35, opacity: 0.9 },
  },
  // Block edge rounding, tilted blocks keep sharp edges
  block: { radius: 0.05, segments: 3 },
  // Bar, its pivot inside the bar width and the ground ring of its reach
  spinner: {
    height: 0.24,
    stripe: 0.04,
    hub: { radius: 0.075, rise: 0.1 },
    trace: { width: 0.05, opacity: 0.28, dashes: 16 },
  },
  portal: {
    tube: 0.05,
    segments: 36,
    spin: 1.6,
    pulse: 0.08,
    pulseSpeed: 4,
    opacity: 0.45,
    lift: 0.012,
    // Exit arrow ahead of the ring: gap, length, width
    arrow: { gap: 0.12, length: 0.3, width: 0.26, opacity: 0.85 },
    // Sparks flying from the entry to the exit: count, size, seconds per trip, arc height
    sparks: { count: 6, size: 0.035, trip: 1.6, arc: 0.35, peak: 1.2 },
  },
  // Spiral arms, turns per arm, outline width, core share of the zone
  vortex: {
    arms: 3,
    twist: 2.2,
    spin: 1.6,
    opacity: 0.9,
    outline: 0.03,
    core: 1.5,
    lift: 0.012,
    segments: 48,
  },
  fan: {
    lift: 0.015,
    // Zone frame on the ground: width, opacity
    frame: { width: 0.04, opacity: 0.5, fill: 0.12 },
    // Wind streaks: count, length, width, height above ground, trips per second
    streaks: {
      count: 24,
      length: 0.42,
      width: 0.03,
      lift: 0.08,
      rise: 0.5,
      speed: 1.1,
      spread: 0.85,
    },
  },
  // Post: rise, height, segments, taper, lowest scale, ground shadow lead share and opacities
  totem: {
    rise: 3,
    height: 1.7,
    segments: 3,
    shrink: 0.9,
    floor: 0.02,
    shadow: { lead: 0.15, low: 0.15, high: 0.55, ring: 0.03 },
  },
  // Splash on a ball lost in water: ms, ring reach, drops, drop height
  splash: { ms: 650, reach: 0.55, drops: 10, rise: 0.5, drop: 0.04 },
} as const
