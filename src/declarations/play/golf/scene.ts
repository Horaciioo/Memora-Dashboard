/**
 * Look of the 3D course, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE = {
  // Pit sunk in the lawn: lip over the cup radius, funnel depth, darkening of funnel and wall
  cup: { segments: 28, lip: 1.5, funnel: 0.09, shade: { funnel: 0.3, wall: 0.65 } },
  // Balls resting in the cup, stacked while the hole waits on the rest
  stack: { gap: 0.09, jitter: 0.035, popMs: 320 },
  pole: { radius: 0.018, segments: 8 },
  flag: { width: 0.42, height: 0.28, drop: 0.16, sway: 0.25, swaySpeed: 2.4 },
  chevron: { size: 1.1, lift: 0.01 },
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
  bumper: {
    segments: 32,
    // Hit bounce: ms, size gain, squash share, half turns, glow
    pulseMs: 450,
    pulse: 0.3,
    squash: 0.55,
    bounces: 2.5,
    glow: 1.1,
    roughness: 0.35,
    // Profiles as radius then height factors: white plate, rounded puck, ring, domed cap
    skin: {
      plate: [
        [0, 0],
        [1.18, 0],
        [1.2, 0.06],
        [1.12, 0.1],
        [0, 0.1],
      ],
      puck: [
        [0, 0.1],
        [0.98, 0.1],
        [1.04, 0.22],
        [1.04, 0.5],
        [0.96, 0.66],
        [0, 0.66],
      ],
      ring: { across: 0.8, up: 0.68, tube: 0.1 },
      cap: [
        [0, 0.66],
        [0.68, 0.66],
        [0.68, 0.78],
        [0.5, 0.86],
        [0, 0.88],
      ],
    },
  },
  spinner: { height: 0.24, stripe: 0.04 },
  // Power orb: glass shell, prism core, satellites, ground ring, pop-in on return
  orb: {
    size: 0.3,
    spin: 1.4,
    tilt: 0.35,
    bob: 0.07,
    bobSpeed: 2.2,
    opacity: 0.55,
    roughness: 0.2,
    mark: 1.02,
    pixels: 128,
    core: 0.14,
    coreSpin: 2.6,
    coreTumble: 0.5,
    coreHue: 0.18,
    hueGap: 0.13,
    satellites: 3,
    satellite: 0.05,
    orbit: 0.3,
    orbitSpeed: 2.2,
    ring: { inner: 0.34, outer: 0.4, opacity: 0.55, pulse: 0.12, pulseSpeed: 3 },
    popMs: 420,
    popOvershoot: 1.5,
  },
  // Tornado: funnel of turning layers, debris, dust at the foot, cloud on top, grow and fade seconds
  tornado: {
    height: 2.7,
    layers: 12,
    base: 0.09,
    top: 1.15,
    curve: 2.2,
    overlap: 1.5,
    spinBase: 9,
    spinTop: 2.4,
    bend: 0.34,
    bendSpeed: 1.2,
    opacity: 0.4,
    segments: 28,
    streaks: 7,
    grow: 0.9,
    fade: 1.6,
    ring: { edge: 0.94, opacity: 0.2, segments: 48, lift: 0.01 },
    debris: { count: 46, size: 0.055, speed: 4.2, rise: 0.32, spread: 0.28, ground: 0.12 },
    dust: { discs: 3, radius: 0.95, opacity: 0.45, spin: 2.4, lift: 0.012, pulse: 0.12 },
    cloud: { puffs: 6, radius: 1.05, size: 0.62, squash: 0.42, opacity: 0.5, spin: 0.5 },
  },
  // Ventilo: flat propeller, translucent blades with an outline, motion ghost, wind squares
  propeller: {
    radius: 0.4,
    blades: 4,
    spin: 11,
    opacity: 0.78,
    ghost: 0.28,
    ghostTurn: 0.5,
    outline: 1.13,
    hub: 0.07,
    lift: 0.02,
    segments: 20,
    grow: 0.4,
    fade: 0.6,
    wind: { squares: 7, size: 0.045, length: 1.8, speed: 0.9, height: 0.14, spread: 0.3 },
  },
  // Ice sheet: sparkle count and size, freeze front speed and glow band, melt seconds, texture
  ice: {
    front: 7,
    band: 0.5,
    lift: 0.006,
    opacity: 0.88,
    melt: 3,
    repeat: 1.6,
    roughness: 0.06,
    clearcoat: 1,
    envIntensity: 1.3,
    sparkles: 70,
    sparkle: 0.04,
    twinkle: 2.4,
    texture: { size: 512, cracks: 9, bubbles: 34, frost: 22 },
  },
  portal: {
    tube: 0.045,
    segments: 36,
    spin: 1.6,
    pulse: 0.08,
    pulseSpeed: 4,
    opacity: 0.45,
    lift: 0.012,
  },
  vortex: { rings: 3, spin: 2.4, tube: 0.03, opacity: 0.35, core: 1.5, lift: 0.012, segments: 40 },
  fan: {
    lift: 0.015,
    puffLift: 0.12,
    puffs: 14,
    puff: 0.035,
    speed: 1.4,
    spread: 0.8,
  },
  totem: { rise: 3, height: 1.7, segments: 3, shrink: 0.9, floor: 0.02 },
  gust: { streaks: 6, length: 1.6, thickness: 0.04, speed: 0.45, height: 0.6, spread: 0.7 },
  ball: {
    segments: 24,
    roughness: 0.35,
    tee: 0.45,
    ghost: 0.4,
    shield: 1.9,
  },
  aim: { lift: 0.02, clickPixels: 6 },
  // Chevrons ahead, more the harder the pull, stretched arm behind ending in a ring
  arrow: {
    lift: 0.02,
    start: 0.32,
    chevrons: 9,
    gap: 0.17,
    width: 0.13,
    length: 0.1,
    shrink: 0.35,
    arm: 0.075,
    armHeight: 0.035,
    ring: 0.15,
    ringHole: 0.085,
    dots: 40,
    dot: 0.032,
    dotGap: 0.22,
    dotFade: 0.5,
    dotOpacity: 0.85,
  },
  place: { ring: 0.08, opacity: 0.6 },
  sink: { depth: 0.3, speed: 1.8 },
  // Square ribbon behind the ball, metres, rows of tiles on the path
  trail: {
    rows: 30,
    cols: 7,
    start: 0.1,
    pitch: 0.055,
    size: 0.05,
    near: 2,
    far: 3.4,
    solid: 0.55,
    fade: 0.12,
    taper: 0.25,
    lengthMin: 0.5,
    lengthMax: 1.65,
    fullSpeed: 4,
    restSpeed: 0.1,
    easeSeconds: 0.12,
    step: 0.05,
    points: 80,
    jump: 1,
    tint: 0.15,
    lift: 0.012,
    twinkle: 0.2,
    twinkleSpeed: 16,
    // Tiles circling the ball at rest, ease rates per second
    ring: {
      tiles: 24,
      radius: 0.25,
      pulse: 0.1,
      pulseSpeed: 3,
      spin: 0.5,
      wave: 0.2,
      gather: 6,
      release: 14,
    },
  },
  // Rainbow swarm of a flash: cubes, seconds of path followed, cube size, spread, turns per second, ease rate, hue shift
  swarm: {
    count: 72,
    seconds: 0.8,
    size: 0.12,
    spread: 0.34,
    spin: 6,
    ease: 9,
    hue: 0.4,
    lift: 0.04,
    twinkle: 0.35,
    twinkleSpeed: 18,
    // Tail shrink, height squash and wobble ratio of the loops
    shrink: 0.6,
    flatten: 0.8,
    wave: 1.3,
    // Golden angle scatters the cubes
    turn: 2.39996,
  },
  // Contact pop, scale gain
  pop: { ms: 240, wall: 0.12, bumper: 0.3, land: 0.1, hit: 0.15 },
  // Reappear after a portal or vortex
  reappear: { ms: 280 },
  // Fall shrink
  vanish: { ms: 450 },
  light: { hemisphere: 1.6, sun: 1.6 },
  fog: { near: 30, far: 90 },
  // Course thumbnails: pixels, frames drawn before the grab, jpeg quality
  shot: { width: 480, height: 480, frames: 4, quality: 0.85 },
  // Hub backdrop: seconds per course, crossfade, pixel ratio, view angles and sway, push-in, fog in multiples of distance
  panorama: {
    seconds: 10,
    fadeMs: 1800,
    dpr: 0.55,
    fov: 34,
    pitch: 0.7,
    yaw: 0.5,
    zoom: 0.36,
    // Share of extra distance at the start, eased out over the seconds a course stays
    push: 0.2,
    swing: 0.18,
    swingSpeed: 0.07,
    far: 6,
    fogNear: 1.1,
    fogFar: 3,
  },
  // Holes of a course packed together, metres, then headings tried in degrees
  map: {
    gap: 3,
    step: 0.5,
    maxReach: 80,
    turns: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  },
  // New hole: balls fall on the tee
  drop: { height: 2.4, ms: 900 },
  // Columns hanging down the walls, one or two each, fading into the mist
  specks: { twoFrom: 3, min: 0.45, max: 0.75, minDrop: 0.5, maxDrop: 1.6, sink: 0.55, under: 0.12 },
  // Lumpy cube clouds around the course
  mist: {
    puffs: 14,
    cubes: 5,
    size: 3.4,
    cubeMin: 0.45,
    flat: 0.6,
    spread: 1.4,
    below: 1.6,
    rise: 0.4,
    opacity: 0.5,
    drift: 0.05,
    // Golden angle spreads the puffs evenly
    turn: 2.39996,
  },
  // Puffy clouds around the course
  clouds: {
    count: 12,
    near: 0.7,
    far: 1.6,
    low: -4,
    high: 2.5,
    minLumps: 3,
    maxLumps: 5,
    gap: 0.9,
    rise: 0.4,
    minSize: 0.6,
    maxSize: 1.2,
    drift: 0.012,
  },
  // One huge plain block butted against a course edge, now and then
  blocks: {
    // Share of holes that get a block at all
    chance: 0.4,
    minSize: 7,
    maxSize: 12,
    minHeight: 6,
    maxHeight: 11,
    // Sunk past the course edge, so no gap ever shows
    overlap: 0.6,
    // Paint tones picked from the palette, by index
    tones: 3,
  },
  sky: { radius: 90, segments: 24 },
  // Stars of the space map
  stars: { count: 220, reach: 0.95, size: 2 },
  // Burst over the cup
  confetti: {
    count: 130,
    spread: 1.9,
    lift: 4.6,
    gravity: 4,
    spin: 14,
    size: 0.1,
    seconds: 2.6,
    // Light pillar and ground ring over the cup
    beam: { radius: 0.26, height: 5, seconds: 1.3, opacity: 0.55 },
    ring: { reach: 3, seconds: 0.9, width: 0.18, opacity: 0.9 },
  },
  sun: { offset: [5, 12, 3] as const, map: 2048, margin: 2, bias: -0.0004, normalBias: 0.02 },
  cheerMs: 2400,
  cueMs: 1600,
  // Avatar above the ball, canvas pixels and ring, metres
  avatar: { lift: 0.4, size: 0.2, pixels: 96, ring: 8 },
} as const

// Rows the round table always shows, empty ones included
export const GOLF_PANEL_ROWS = 5
