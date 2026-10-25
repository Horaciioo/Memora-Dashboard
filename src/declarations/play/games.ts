import { createRegistry } from '@/core/lib/registry'
import { BACCALAUREAT_SETTINGS } from '@/declarations/play/settings'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Identity of one game
 * @typedef {Object} PlayGameMeta
 * @property {string} label - Display name
 * @property {string} slug - URL segment
 * @property {string} tone - Colour token
 * @property {string} logo - Logo glyph key
 * @property {string} backdrop - Background motif
 * @property {number} minPlayers - Seat floor
 * @property {number} maxPlayers - Seat ceiling
 * @property {boolean} playable - Engine shipped
 */

export interface PlayGameMeta {
  label: string
  slug: string
  tone: string
  logo: string
  backdrop: string
  minPlayers: number
  maxPlayers: number
  playable: boolean
}

/**
 * Games of Memora Play
 * @type {Registry<PlayGameName, PlayGameMeta>}
 */

export const PLAY_GAMES = createRegistry<PlayGameName, PlayGameMeta>({
  [PlayGames.Baccalaureat]: {
    label: 'Baccalauréat',
    slug: 'baccalaureat',
    tone: '--play-baccalaureat',
    logo: 'playBaccalaureat',
    backdrop: 'double-grid',
    minPlayers: BACCALAUREAT_SETTINGS.minPlayers,
    maxPlayers: BACCALAUREAT_SETTINGS.maxPlayers,
    playable: true,
  },
  [PlayGames.Golf]: {
    label: 'Golf',
    slug: 'golf',
    tone: '--play-golf',
    logo: 'playGolf',
    backdrop: 'turf',
    minPlayers: 1,
    maxPlayers: 8,
    playable: false,
  },
  [PlayGames.Bomb]: {
    label: 'Bombe',
    slug: 'bombe',
    tone: '--play-bomb',
    logo: 'playBomb',
    backdrop: 'fuse',
    minPlayers: 2,
    maxPlayers: 12,
    playable: false,
  },
  [PlayGames.Ludo]: {
    label: 'Ludo',
    slug: 'ludo',
    tone: '--play-ludo',
    logo: 'playLudo',
    backdrop: 'board',
    minPlayers: 2,
    maxPlayers: 4,
    playable: false,
  },
})
