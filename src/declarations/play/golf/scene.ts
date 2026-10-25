/**
 * Look of the 3D course, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE = {
  cup: { segments: 32, rim: 1.25, lift: 0.004 },
  pole: { radius: 0.018, segments: 8 },
  flag: { width: 0.42, height: 0.28, drop: 0.16, sway: 0.25, swaySpeed: 2.4 },
  chevron: { radius: 0.3, opacity: 0.7, lift: 0.01 },
  water: { sink: 0.04, opacity: 0.82 },
  roughness: { turf: 0.95, ice: 0.15, surface: 0.9, side: 1, rail: 0.7, block: 0.8 },
  bumper: { segments: 24, pulseMs: 260, pulse: 0.25, roughness: 0.4 },
  spinner: { postRadius: 0.07, height: 0.24 },
  orb: { size: 0.17, spin: 1.6, bob: 0.06, bobSpeed: 2.2, glow: 0.6 },
  tornado: {
    rings: 4,
    spin: 3.2,
    opacity: 0.35,
    ground: 0.18,
    rise: 1.6,
    edge: 0.92,
    segments: 48,
    base: 0.2,
    step: 0.16,
    tube: 0.035,
    arc: 1.6,
    ringOpacity: 0.8,
    fade: 0.12,
  },
  ball: {
    segments: 24,
    roughness: 0.35,
    shadow: 1.6,
    shadowOpacity: 0.28,
    shadowLift: 0.004,
    tee: 0.45,
    ghost: 0.4,
    shield: 1.9,
  },
  aim: { width: 0.07, lift: 0.02, ring: 0.05, ringPulse: 3, pulse: 0.12, clickPixels: 6 },
  place: { ring: 0.08, opacity: 0.6 },
  sink: { depth: 0.3, speed: 1.8 },
  light: { hemisphere: 1.1, sun: 1.6, sunPosition: [6, 14, 4] as const },
  fog: { near: 16, far: 52 },
  // Little cubes popping out of the outer walls
  specks: { perMetre: 5, min: 0.07, max: 0.2, sink: 0.4, tilt: 0.6 },
  // Puffs of mist around the course
  mist: {
    puffs: 14,
    size: 9,
    flat: 0.6,
    spread: 1.4,
    below: 1.6,
    rise: 0.4,
    opacity: 0.22,
    drift: 0.05,
    pixels: 128,
    // Golden angle spreads the puffs evenly
    turn: 2.39996,
  },
  label: { lift: 0.42, width: 256, height: 64, font: 30, height3d: 0.18, shadow: 6 },
} as const
