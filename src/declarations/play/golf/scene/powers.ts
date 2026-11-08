/**
 * Powers, orbs and cheers, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE_POWERS = {
  // Power card: rainbow card swinging over a soft ground shade, pop-in on return
  orb: {
    bob: 0.025,
    bobSpeed: 1.6,
    phase: 2.1,
    spin: 1.3,
    // Card size in orb radii, swing in radians
    card: { width: 1.7, height: 2.3, depth: 0.12, swing: 0.8 },
    shade: { size: 2.1, opacity: 0.32, shrink: 0.45, lift: 0.004 },
    popMs: 420,
    // Taken: swells a little then implodes
    implodeMs: 260,
    implodeSwell: 0.35,
    popOvershoot: 1.5,
    handFullMs: 1600,
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
  // Ventilo: upright propeller on a post, translucent blades, motion ghost, wind squares
  propeller: {
    radius: 0.4,
    height: 0.5,
    foot: 0.05,
    post: 0.03,
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
  gust: { streaks: 6, length: 1.6, thickness: 0.04, speed: 0.45, height: 0.6, spread: 0.7 },
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
  // Words floating over the cup: ms, rise above the flag, sway, stack gap, canvas and world sizes
  cupCheer: {
    ms: 2200,
    lift: 0.35,
    rise: 0.45,
    sway: 0.04,
    swaySpeed: 5,
    gap: 0.22,
    pixels: { width: 1024, height: 128, font: 72, stroke: 14 },
    width: 2.2,
  },
  cueMs: 1600,
} as const
