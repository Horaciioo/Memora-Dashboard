import { createRegistry } from '@/core/lib/registry'
import { BOMB_EMBERS } from '@/declarations/play/bomb/copy'
import { BOMB_SETTINGS } from '@/declarations/play/bomb/settings'
import { GOLF_TURF } from '@/declarations/play/golf/copy'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { PLAY_PAPER } from '@/declarations/play/paper'
import { BACCALAUREAT_SETTINGS } from '@/declarations/play/settings'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Identity of one game
 * @typedef {Object} PlayGameMeta
 * @property {string} label - Display name
 * @property {string} slug - URL segment
 * @property {string} tagline - Card pitch
 * @property {string} tone - Colour token
 * @property {string} logo - Logo glyph key
 * @property {string} backdrop - Background motif
 * @property {string | null} ground - Hub page ground, the room when null
 * @property {number} minPlayers - Seat floor
 * @property {number} maxPlayers - Seat ceiling
 * @property {boolean} playable - Engine shipped
 */

export interface PlayGameMeta {
  label: string
  slug: string
  tagline: string
  tone: string
  logo: string
  backdrop: string
  ground: string | null
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
    tagline: 'Une lettre, des catégories, le plus rapide gagne.',
    tone: '--play-baccalaureat',
    logo: 'playBaccalaureat',
    backdrop: 'double-grid',
    ground: PLAY_PAPER.ground,
    minPlayers: BACCALAUREAT_SETTINGS.minPlayers,
    maxPlayers: BACCALAUREAT_SETTINGS.maxPlayers,
    playable: true,
  },
  [PlayGames.Golf]: {
    label: 'Golf',
    slug: 'golf',
    tagline: 'Un parcours, un swing, le moins de coups possible.',
    tone: '--play-golf',
    logo: 'playGolf',
    backdrop: 'turf',
    ground: GOLF_TURF.ground,
    minPlayers: GOLF_SETTINGS.minPlayers,
    maxPlayers: GOLF_SETTINGS.maxPlayers,
    playable: true,
  },
  [PlayGames.Bomb]: {
    label: 'Bomb Party',
    slug: 'bomb-party',
    tagline: 'Une syllabe, un mot, passe la bombe avant qu’elle explose.',
    tone: '--play-bomb',
    logo: 'playBomb',
    backdrop: 'fuse',
    ground: BOMB_EMBERS.ground,
    minPlayers: BOMB_SETTINGS.minPlayers,
    maxPlayers: BOMB_SETTINGS.maxPlayers,
    playable: true,
  },
  [PlayGames.Ludo]: {
    label: 'Ludo',
    slug: 'ludo',
    tagline: 'Quatre couleurs, un dé, ramène tes pions à la maison.',
    tone: '--play-ludo',
    logo: 'playLudo',
    backdrop: 'board',
    ground: null,
    minPlayers: 2,
    maxPlayers: 4,
    playable: false,
  },
})

/**
 * Game behind a URL segment
 * @param {string} slug - URL segment
 * @return {PlayGameName | null} - Game or nothing
 */

export const playGameOfSlug = (slug: string): PlayGameName | null =>
  PLAY_GAMES.keys.find((game) => PLAY_GAMES.get(game).slug === slug) ?? null

/**
 * Keys painted in a game's colour
 * @param {PlayGameName} game - Game
 * @return {Record<string, string>} - Style variables
 */

export const playKeysOf = (game: PlayGameName): Record<string, string> => {
  const { tone } = PLAY_GAMES.get(game)

  return {
    '--play-key': `var(${tone})`,
    '--play-key-deep': `var(${tone}-deep)`,
  }
}
