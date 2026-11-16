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
  detail: { crossings: 0.8, provinces: 1, provinceNames: 2.4, buildings: 0.7 },
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
  token: { base: 1.9, min: 15, max: 38, ring: 2.2, glyph: 0.62, pip: 0.09, badge: 0.27 },
  // Missiles: trail, reticle and the fallout ground
  strike: {
    arc: 0.28,
    trail: 0.12,
    ring: 2.5,
    red: [196, 56, 52],
    dark: [58, 34, 40],
    fallout: 0.22,
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
  ship: { min: 12 },
  // Arrow of a corps, width from its troops
  arrow: { min: 2, max: 9, scale: 0.012, dash: [10, 7], speed: 0.04, head: 1.7 },
  // Hover wash over a nation, then the picked ring of a start
  wash: { alpha: 0.28, rgb: [255, 255, 255] },
  pick: { fill: 0.22, line: 2.5, rgb: [255, 255, 255] },
  // Province lines and names on the paper
  paper: { line: [30, 52, 64], alpha: 0.28, ownDark: 0.55, name: [32, 48, 58], nameAlpha: 0.7 },
  // Conquest front: lifetime, spread over a diff, whitening, opacity, smallest zoom, queue cap
  flash: { ms: 700, spread: 260, lift: 0.18, alpha: 0.4, minScale: 1.2, cap: 12000 },
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
  labelMs: 1000,
  // Engagement slider, in percent
  engage: { min: 10, max: 100, step: 5, initial: 20 },
  // Floating boxes over the map, in pixels
  menu: { width: 240, height: 220, gap: 12 },
  strikeMenu: { width: 240, height: 140 },
  tip: { width: 240, height: 96, gap: 16 },
  // Tiles seen from top to bottom when the camera lands on a nation
  focusTiles: 480,
  minimap: { width: 224, border: 2, frame: 'rgb(255 255 255)' },
} as const
