/**
 * Balls, aim and trails, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE_BALL = {
  ball: {
    // Bumper ball puck height, ball radii
    bumperHeight: 1.4,
    segments: 24,
    roughness: 0.35,
    tee: 0.45,
    ghost: 0.4,
    shield: 1.9,
  },
  // Power looks: giant growth steps, squash, breathing, mini spin, ghost vapour, bubble wave and burst
  ballFx: {
    giantSteps: 3,
    squash: 0.25,
    breathe: 0.03,
    breatheMs: 260,
    spin: 12.6,
    vapour: 0.08,
    vapourMs: 180,
    bubbleFrom: 2.2,
    wave: 0.05,
    waveMs: 120,
    burst: 0.6,
  },
  // Burst of squares on a ball a power lands on, and the puff when it wears off
  castBurst: {
    count: 16,
    size: 0.05,
    reach: 0.6,
    rise: 0.5,
    ring: 0.5,
    ringInner: 0.9,
    segments: 32,
    endShare: 0.5,
  },
  // Pencil wiping the aim of a blind ball
  eraser: { size: 0.22, lift: 0.18, tilt: 0.6, radius: 0.14, tip: 0.25, rubber: 0.18 },
  aim: { lift: 0.02, clickPixels: 6 },
  // Chevrons ahead, more the harder the pull, stretched arm behind ending in a ring
  arrow: {
    lift: 0.035,
    // Metres either side of a mark to read the slope
    slopeStep: 0.08,
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
    // Guide marks: outer half side, hole of the frame and core, shares of it
    dot: 0.026,
    frameHole: 0.72,
    core: 0.46,
    frameOpacity: 0.5,
    dotGap: 0.22,
    dotFade: 0.5,
    dotOpacity: 0.85,
  },
  place: { ring: 0.08, opacity: 0.6, square: 0.12 },
  // Ground cells lit under the rolling ball, fading behind it
  trail: {
    // Most cells lit at once
    cells: 90,
    // Seconds a cell stays lit, share of that spent shrinking out
    seconds: 1.1,
    fade: 0.6,
    // Cell share covered by the lit square
    fill: 0.88,
    // Slab height over the ground, rest speed, jump that cuts the path
    lift: 0.012,
    thickness: 0.01,
    restSpeed: 0.1,
    easeSeconds: 0.12,
    jump: 1,
    tint: 0.3,
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
  // Lost ball back on its spot: travel, hang, drop and bounce ms, hang height, bounce share, squash, fade when motion is reduced
  respawn: {
    travelMs: 260,
    hangMs: 60,
    dropMs: 220,
    bounceMs: 160,
    totalMs: 700,
    height: 1.6,
    bounce: 0.14,
    squash: 0.28,
    fadeMs: 180,
    // Air rushing up during the drop, dust ring on impact
    wind: { count: 18, size: 0.035, streak: 5, spread: 0.22, rise: 1.2, reach: 0.55, opacity: 0.8 },
  },
  // New hole: balls fall on the tee
  drop: { height: 2.4, ms: 900 },
  // Avatar above the ball, canvas pixels and ring, metres
  avatar: { lift: 0.4, size: 0.2, pixels: 96, ring: 8 },
} as const
