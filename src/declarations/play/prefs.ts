import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * One display switch of a game
 * @typedef {Object} PlayPrefSpec
 * @property {string} key - Switch key
 * @property {string} label - Name
 * @property {string} hint - What it changes
 * @property {boolean} initial - Value before the player chooses
 */

export interface PlayPrefSpec {
  key: string
  label: string
  hint: string
  initial: boolean
}

// Time bar, shared by the games that draw one in their HUD
export const PLAY_CLOCK_PREF: PlayPrefSpec = {
  key: 'clock',
  label: 'Barre de temps',
  hint: 'La barre qui se vide pendant la manche.',
  initial: true,
}

/**
 * Display switches of each game, in menu order
 * @type {Partial<Record<PlayGameName, PlayPrefSpec[]>>}
 */

export const PLAY_PREFS: Partial<Record<PlayGameName, PlayPrefSpec[]>> = {
  [PlayGames.Baccalaureat]: [
    PLAY_CLOCK_PREF,
    {
      key: 'spellcheck',
      label: 'Correcteur orthographique',
      hint: 'Souligne les mots que le navigateur ne connaît pas.',
      initial: false,
    },
  ],
  [PlayGames.Bomb]: [
    {
      key: 'shake',
      label: 'Secousses et éclats',
      hint: 'Le choc sur le joueur touché quand la bombe explose.',
      initial: true,
    },
    {
      key: 'words',
      label: 'Mots des autres',
      hint: 'Le mot en cours et le dernier mot sous chaque joueur.',
      initial: true,
    },
  ],
  [PlayGames.Ludo]: [
    {
      key: 'path',
      label: 'Aperçu du trajet',
      hint: 'Les pas et le pion fantôme avant de jouer un pion.',
      initial: true,
    },
  ],
  [PlayGames.StopGo]: [
    {
      key: 'follow',
      label: 'Centrer la caméra sur le joueur actuel',
      hint: 'Coché, la caméra se place seule sur la voiture dont c’est le tour. Décoché, elle reste où tu l’as laissée.',
      initial: true,
    },
    {
      key: 'flights',
      label: 'Effets de course',
      hint: 'Les bonus et malus qui volent vers les voitures.',
      initial: true,
    },
  ],
  [PlayGames.Echo]: [PLAY_CLOCK_PREF],
  [PlayGames.Glitch]: [PLAY_CLOCK_PREF],
  [PlayGames.Jumble]: [PLAY_CLOCK_PREF],
  [PlayGames.Croquis]: [PLAY_CLOCK_PREF],
  [PlayGames.Suspens]: [PLAY_CLOCK_PREF],
}

/**
 * Copy of the HUD switch and the game switches
 * @type {Record<string, string>}
 */

export const PLAY_PREFS_COPY = {
  hud: 'Afficher le HUD',
  hudHint: 'Joueurs, infos de la partie et scores en surimpression. Les touches restent.',
  title: 'Affichage de la partie',
} as const

/**
 * Store key of a game switch
 * @param {PlayGameName} game - Game
 * @param {string} key - Switch key
 * @return {string} - Store key
 */

export const playPrefId = (game: PlayGameName, key: string): string => `${game}.${key}`

/**
 * Value of a switch before any choice
 * @param {PlayGameName} game - Game
 * @param {string} key - Switch key
 * @return {boolean} - Initial value
 */

export const playPrefInitial = (game: PlayGameName, key: string): boolean =>
  PLAY_PREFS[game]?.find((spec) => spec.key === key)?.initial ?? true
