/**
 * Frames a game illustration is cut to: upright card, wide launcher tile
 * @type {object}
 */

export const GAME_ART_FRAMES = {
  card: { width: 360, height: 480 },
  tile: { width: 640, height: 320 },
} as const

export type GameArtFrame = keyof typeof GAME_ART_FRAMES
