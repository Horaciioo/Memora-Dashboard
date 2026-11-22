import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Finale scene of a game, played before the podium
 * @typedef {Object} PlayFinale
 * @property {string} word - Word slammed once the scene peaks
 * @property {number} bits - Decorative pieces the scene moves
 */

export interface PlayFinale {
  word: string
  bits: number
}

/**
 * Finale of each game, the scene itself lives in play/finale.css under the same key
 * @type {Record<PlayGameName, PlayFinale>}
 */

export const PLAY_FINALES: Record<PlayGameName, PlayFinale> = {
  [PlayGames.Baccalaureat]: { word: 'Stop !', bits: 3 },
  [PlayGames.Golf]: { word: 'Dans le trou !', bits: 3 },
  [PlayGames.Bomb]: { word: 'Boum !', bits: 4 },
  [PlayGames.Ludo]: { word: 'Arrivé !', bits: 2 },
  [PlayGames.Naval]: { word: 'Coulé !', bits: 5 },
  [PlayGames.Jumble]: { word: 'Mots rangés', bits: 5 },
  [PlayGames.Echo]: { word: 'Écho...', bits: 4 },
  [PlayGames.Glitch]: { word: 'Repéré !', bits: 5 },
  [PlayGames.Croquis]: { word: 'Dernier trait', bits: 2 },
  [PlayGames.Suspens]: { word: 'Rideau', bits: 2 },
  [PlayGames.StopGo]: { word: 'Arrivée !', bits: 2 },
  [PlayGames.Concordat]: { word: 'Victoire', bits: 3 },
}

// Fallback word when a game has no scene
export const PLAY_FINALE_DEFAULT = 'Terminé'
