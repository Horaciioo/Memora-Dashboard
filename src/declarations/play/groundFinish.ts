/**
 * Print finish of a hub ground: grain, vignette, one light, each game its own dosage
 * Shares are 0 to 1, the light sits in percent of the screen
 * @type {Record<string, { grain: number; vignette: number; light: { x: number; y: number; color: string; share: number } }>}
 */

export const GROUND_FINISH: Record<
  string,
  { grain: number; vignette: number; light: { x: number; y: number; color: string; share: number } }
> = {
  'play-paper': {
    grain: 0.5,
    vignette: 0.16,
    light: { x: 30, y: 10, color: '#fff6dc', share: 0.45 },
  },
  'play-fuse': {
    grain: 0.7,
    vignette: 0.55,
    light: { x: 78, y: 70, color: '#ff8a3d', share: 0.3 },
  },
  'play-jumble': {
    grain: 0.6,
    vignette: 0.5,
    light: { x: 70, y: 85, color: '#ffd9a0', share: 0.28 },
  },
  'play-echo': {
    grain: 0.35,
    vignette: 0.45,
    light: { x: 25, y: 20, color: '#8ff0ff', share: 0.22 },
  },
  'play-croquis': {
    grain: 0.65,
    vignette: 0.14,
    light: { x: 18, y: 8, color: '#fffdf2', share: 0.4 },
  },
  'play-suspens': {
    grain: 0.8,
    vignette: 0.7,
    light: { x: 78, y: 45, color: '#ffb35c', share: 0.32 },
  },
  'play-glitch': {
    grain: 0.9,
    vignette: 0.6,
    light: { x: 50, y: 50, color: '#ff4fd8', share: 0.2 },
  },
  'play-turf': {
    grain: 0.45,
    vignette: 0.4,
    light: { x: 72, y: 58, color: '#ffd98a', share: 0.35 },
  },
  'play-ludo': {
    grain: 0.55,
    vignette: 0.5,
    light: { x: 30, y: 10, color: '#ffcf8a', share: 0.35 },
  },
  'play-sea': {
    grain: 0.5,
    vignette: 0.55,
    light: { x: 74, y: 62, color: '#59e0b8', share: 0.2 },
  },
  'play-road': {
    grain: 0.55,
    vignette: 0.5,
    light: { x: 50, y: 48, color: '#ff9a5a', share: 0.3 },
  },
  'concordat-map': {
    grain: 0.55,
    vignette: 0.5,
    light: { x: 40, y: 30, color: '#e8c987', share: 0.2 },
  },
}
