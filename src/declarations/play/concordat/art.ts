import { CONCORDAT } from '@/declarations/play/concordat/rules'

/**
 * Concordat table: the map as a board game laid on open sea
 * @type {Object}
 */

export const CONCORDAT_ART = {
  // Nation colours, hue steps around the wheel and two lightness rows
  nation: { hueStart: 8, hueStep: 137.5, saturation: 0.5, lightness: [0.58, 0.5] },
  // Territory alpha, inside then on its border
  territory: { fill: 0.5, edge: 0.85, edgeShade: 0.72 },
  // Board frame around the paper map, in tiles then pixels
  frame: { size: 0.9, min: 8, max: 18, rgb: [236, 239, 241], shadow: [14, 48, 70] },
  // Hard drop shadow of the frame, in pixels
  drop: { x: 6, y: 8, alpha: 0.42 },
  // Camera limits in pixels per tile, wheel divisor as OpenFront, zoom out room past the whole map
  zoom: {
    max: 12,
    fit: 0.94,
    out: 0.5,
    divisor: 600,
    pinchBoost: 10,
    deadZone: 2,
    keyStep: 0.4,
    pan: 80,
    glide: 110,
  },
  // Zoom steps that unlock details
  detail: { crossings: 0.8, provinces: 1, provinceNames: 2.4, buildings: 1.1 },
  // Boat on a river crossing, in tiles then pixels
  boat: {
    size: 2.4,
    min: 12,
    max: 26,
    rgb: [236, 244, 248],
    alpha: 0.92,
    bobMs: 520,
    bob: 0.05,
    sway: 0.05,
    wake: [236, 244, 248],
    rim: [244, 248, 250],
    gun: [40, 52, 60],
    // Tiles a boat glides per second at best
    glide: 1,
  },
  // Building token, in pixels, then its ring and level pips
  token: { base: 1.2, min: 8, max: 26, ring: 1.4, glyph: 0.62, pip: 0.09, badge: 0.27 },
  // Missiles: trail, reticle and the fallout ground
  strike: {
    arc: 0.28,
    trail: 0.12,
    ring: 2.5,
    red: [196, 56, 52],
    dark: [58, 34, 40],
    fallout: 0.22,
  },
  // War on the map: bursts per kind (milliseconds, share of the blast radius, smoke puffs, sparks, shake in pixels)
  war: {
    bursts: {
      heavy: { ms: 3200, reach: 0.95, puffs: 14, sparks: 22, shake: 12, flash: 0.55 },
      missile: { ms: 2200, reach: 0.9, puffs: 9, sparks: 14, shake: 6, flash: 0.3 },
      rocket: { ms: 1500, reach: 0.85, puffs: 5, sparks: 9, shake: 3, flash: 0.12 },
      shell: { ms: 1100, reach: 0.8, puffs: 3, sparks: 6, shake: 1.6, flash: 0 },
      flak: { ms: 800, reach: 1, puffs: 2, sparks: 7, shake: 0, flash: 0 },
      wreck: { ms: 2400, reach: 1, puffs: 5, sparks: 8, shake: 1.5, flash: 0 },
    },
    // Smallest burst on screen, in pixels, and its size for an air burst
    minBurst: 12,
    flakSize: 20,
    shakeMs: 550,
    fire: { core: [255, 246, 200], mid: [255, 178, 40], edge: [226, 74, 20], smoke: [46, 40, 40] },
    // Missile on screen: body length and flame in pixels, smoke puffs behind it
    missile: {
      length: 15,
      heavyLength: 22,
      flame: 11,
      puffs: 16,
      puffStep: 0.014,
      interceptTicks: 20,
    },
    // Aircraft on screen, tile share of the sprite then pixel bounds
    plane: { size: 2.8, min: 16, max: 36, trail: 10, trailStep: 2.4, shadow: 0.22, rotor: 0.045 },
    // Shot lines last this many ticks
    tracerTicks: 9,
    tracer: [255, 232, 140],
    interceptor: [255, 255, 255],
    // Scars: sprite pixels, size over the blast radius, burn time in ticks and fire pulse
    scar: { sprite: 96, grow: 1.15, burnTicks: 900, alpha: 0.78, pulseMs: 380 },
    // Mood: how the tension builds, from the clock, the land taken, scars, shots in the air and fallout
    mood: {
      rise: 4500,
      fall: 12000,
      clock: { minutes: 24, weight: 0.22 },
      claimed: 0.22,
      scars: { count: 70, weight: 0.4 },
      live: { count: 8, weight: 0.2 },
      fallout: { count: 8, weight: 0.14 },
      min: 0.02,
    },
    // Atmosphere at full tension
    air: {
      dim: [138, 118, 112],
      dimAlpha: 0.5,
      grey: [118, 112, 110],
      greyAlpha: 0.42,
      vignette: [20, 10, 10],
      vignetteAlpha: 0.62,
      smoke: { max: 14, size: 0.55, speed: 0.012, alpha: 0.16 },
      embers: { max: 70, speed: 0.03, alpha: 0.8 },
      flash: { everyMs: 2600, minTension: 0.2, ms: 420, size: 0.07 },
    },
  },
  // Nation names, size share of the territory span and pixel bounds
  label: {
    share: 0.2,
    min: 11,
    max: 30,
    minTiles: 28,
    troopSize: 0.62,
    troopGap: 0.78,
    stroke: 4,
    halo: [246, 249, 250],
    ink: [28, 40, 50],
  },
  // Pawn over a capital, in pixels at the current zoom
  pawn: { base: 1.7, min: 8, max: 20, ring: 2.4, aiScale: 4 },
  // Smallest boat on screen, in pixels
  // Round tag over it: radius and lift from the hull length, white rim
  ship: { min: 22, badge: { radius: 0.4, lift: 0.85, rim: 1.5 } },
  // Trade lines: width from zoom, arc, casing, cut grey, pulse size and speed
  routes: {
    min: 1.5,
    max: 5,
    base: 0.28,
    arc: 0.12,
    alpha: 0.85,
    casing: 0.7,
    halo: 2.5,
    cut: [150, 150, 150],
    dash: [6, 6],
    pulse: 0.9,
    pulseMs: 3000,
    pulseSlow: 6,
  },
  // Arrow of a corps, width from its troops
  arrow: {
    min: 2,
    max: 9,
    scale: 0.012,
    dash: [10, 7],
    speed: 0.04,
    head: 1.7,
    alarm: [214, 76, 64],
    alarmWidth: 1.5,
    label: 11,
  },
  // Target ring and emoji bubble, sizes in pixels and seconds
  signal: {
    target: [214, 76, 64],
    radius: 16,
    line: 3,
    pulse: 0.006,
    emoji: 20,
    seconds: 5,
    lift: 34,
    rise: 22,
  },
  // Hover wash over a nation, then the picked ring of a start
  wash: { alpha: 0.28, rgb: [255, 255, 255] },
  pick: { fill: 0.22, line: 2.5, rgb: [255, 255, 255] },
  // Province lines and names on the paper
  paper: { line: [30, 52, 64], alpha: 0.28, ownDark: 0.55, name: [32, 48, 58], nameAlpha: 0.7 },
  // Conquest front: lifetime, spread over a diff, whitening, opacity, smallest zoom, queue cap
  flash: { ms: 700, spread: 260, minSpread: 90, lift: 0.18, alpha: 0.4, minScale: 1.2, cap: 12000 },
  // Click echo: lifetime of a mark, ripple radius in pixels, goal ring while expanding
  mark: { ms: 9000, ripple: 700, reach: 46, goal: 12, red: [214, 76, 64] },
  // Pixel ratio cap of the canvas
  maxDpr: 2,
  // Frames per second while something moves
  fps: 30,
  // Start radius in tiles, from the start area
  startRadius: Math.sqrt(CONCORDAT.map.start.tiles / Math.PI),
  // Tiles changed above this share trigger a whole repaint
  repaintShare: 0.15,
  // Label recompute rhythm
  labelMs: 2500,
  // Engagement slider, in percent
  engage: { min: 1, max: 100, step: 1, initial: 20, hotkeyStep: 5 },
  // Floating boxes over the map, in pixels
  menu: { width: 240, height: 290, gap: 12 },
  strikeMenu: { width: 240, height: 140 },
  tip: { width: 240, height: 96, gap: 16 },
  // Tiles seen from top to bottom when the camera lands on a nation
  focusTiles: 480,
  minimap: { width: 224, border: 2, frame: 'rgb(255 255 255)' },
} as const
