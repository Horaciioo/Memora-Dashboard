import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Games with their own screen HUD
 * @type {ReadonlySet<PlayGameName>}
 */

export const PLAY_HUD_GAMES: ReadonlySet<PlayGameName> = new Set([
  PlayGames.Baccalaureat,
  PlayGames.Golf,
  PlayGames.Echo,
  PlayGames.Bomb,
  PlayGames.Ludo,
  PlayGames.Glitch,
  PlayGames.Jumble,
  PlayGames.Naval,
  PlayGames.Croquis,
  PlayGames.Suspens,
  PlayGames.StopGo,
])

/**
 * Block skin of the chat laid over a HUD table, the one of the game's own blocks
 * @type {ReadonlyMap<PlayGameName, string>}
 */

export const PLAY_HUD_SKINS: ReadonlyMap<PlayGameName, string> = new Map([
  [PlayGames.Baccalaureat, 'play-hud-block'],
  [PlayGames.Golf, 'golf-hud-theme golf-block'],
  [PlayGames.Echo, 'play-hud-block'],
  [PlayGames.Bomb, 'play-hud-block'],
  [PlayGames.Ludo, 'play-hud-block'],
  [PlayGames.Glitch, 'play-hud-block'],
  [PlayGames.Jumble, 'play-hud-block'],
  [PlayGames.Naval, 'play-hud-block'],
  [PlayGames.Croquis, 'play-hud-block'],
  [PlayGames.Suspens, 'play-hud-block'],
  [PlayGames.StopGo, 'play-hud-block'],
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

/**
 * Glitch HUD copy
 * @type {Record<string, string>}
 */

export const GLITCH_HUD_COPY = {
  round: 'Manche',
  clock: 'Temps',
  found: 'Trouvées',
} as const

/**
 * Jumble HUD copy
 * @type {Record<string, string>}
 */

export const JUMBLE_HUD_COPY = {
  round: 'Manche',
  clock: 'Temps',
  place: 'Place',
} as const

/**
 * Suspens HUD copy
 * @type {Record<string, string>}
 */

export const SUSPENS_HUD_COPY = {
  round: 'Manche',
  clock: 'Temps',
  setter: 'Meneur',
  place: 'Place',
} as const

/**
 * Croquis HUD copy
 * @type {Record<string, string>}
 */

export const CROQUIS_HUD_COPY = {
  round: 'Manche',
  clock: 'Temps',
  drawer: 'Dessine',
  you: 'Toi',
  place: 'Place',
} as const

/**
 * Baccalaureat HUD copy
 * @type {Record<string, string>}
 */

export const BAC_HUD_COPY = {
  round: 'Manche',
  letter: 'Lettre',
  clock: 'Temps',
  written: 'Prêts',
  voted: 'Votes',
} as const

/**
 * Naval HUD copy
 * @type {Record<string, string>}
 */

export const NAVAL_HUD_COPY = {
  crew: 'Capitaines',
  sunk: 'Navires coulés',
} as const

/**
 * Skin variant of a game's HUD, read from its board: the naval map
 * @param {PlayGameName} game - Game
 * @param {unknown} board - Board view
 * @return {string | undefined} - Variant, none when the HUD has one look
 */

export const hudSkinOf = (game: PlayGameName, board: unknown): string | undefined => {
  if (game !== PlayGames.Naval) return undefined
  const map = (board as { settings?: { map?: unknown } } | null)?.settings?.map

  return typeof map === 'string' ? map : undefined
}

/**
 * Skin variant of a launch vote: the naval map being picked, or already chosen
 * @param {PlayGameName} game - Game
 * @param {{ step: string; chosen: Record<string, string> }} vote - Vote
 * @param {string} leader - Choice leading the current step
 * @return {string | undefined} - Variant
 */

export const voteSkinOf = (
  game: PlayGameName,
  vote: { step: string; chosen: Record<string, string> },
  leader: string
): string | undefined =>
  game === PlayGames.Naval ? (vote.step === 'map' ? leader : vote.chosen.map) : undefined
