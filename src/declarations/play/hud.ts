import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Games with their own screen HUD
 * @type {ReadonlySet<PlayGameName>}
 */

export const PLAY_HUD_GAMES: ReadonlySet<PlayGameName> = new Set([
  PlayGames.Golf,
  PlayGames.Echo,
  PlayGames.Bomb,
  PlayGames.Ludo,
])

/**
 * Block skin of the chat laid over a HUD table, the one of the game's own blocks
 * @type {ReadonlyMap<PlayGameName, string>}
 */

export const PLAY_HUD_SKINS: ReadonlyMap<PlayGameName, string> = new Map([
  [PlayGames.Golf, 'golf-hud-theme golf-block'],
  [PlayGames.Echo, 'play-hud-block'],
  [PlayGames.Bomb, 'play-hud-block'],
  [PlayGames.Ludo, 'play-hud-block'],
])

/**
 * Shared HUD copy
 * @type {Record<string, string>}
 */

export const PLAY_HUD_COPY = {
  settings: 'Paramètres',
  scorecard: 'Scores',
  collapse: 'Réduire',
  expand: 'Développer',
  windowed: 'Quitter le plein écran',
  fullscreen: 'Plein écran',
  showChat: 'Afficher le chat',
  hideChat: 'Masquer le chat',
} as const

/**
 * Echo HUD copy
 * @type {Record<string, string>}
 */

export const ECHO_HUD_COPY = {
  card: 'Manche',
  clock: 'Temps',
  place: 'Place',
  score: 'Score',
} as const

/**
 * Bomb HUD copy
 * @type {Record<string, string>}
 */

export const BOMB_HUD_COPY = {
  turn: 'Tour',
  prompt: 'Syllabe',
  fuse: 'Mèche',
  lives: 'Vies',
} as const

/**
 * Ludo HUD copy
 * @type {Record<string, string>}
 */

export const LUDO_HUD_COPY = {
  turn: 'Tour',
  home: 'Maison',
  time: 'Temps',
} as const
