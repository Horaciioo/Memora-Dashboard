import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Powers an owner may use on a game
 * @type {readonly string[]}
 */

export const NEXUS_GAME_CAPABILITIES = [
  'pause',
  'resume',
  'restart',
  'skipTurn',
  'forceTurn',
  'setScore',
  'kick',
  'addBot',
  'removeBot',
  'setDeadline',
  'replay',
] as const

export type NexusGameCapability = (typeof NEXUS_GAME_CAPABILITIES)[number]

/**
 * Decision taken on one game
 * @typedef {Object} GameEntry
 * @property {string[]} moves - Prisma models holding its moves
 * @property {NexusGameCapability[]} capabilities - Powers with a real handler
 */

export interface GameEntry {
  moves: string[]
  capabilities: NexusGameCapability[]
}

/**
 * Every game, with its history models
 * @type {Record<PlayGameName, GameEntry>}
 */

export const GAME_INVENTORY: Record<PlayGameName, GameEntry> = {
  [PlayGames.Baccalaureat]: {
    moves: ['BaccalaureatRound', 'BaccalaureatAnswer', 'BaccalaureatVote'],
    capabilities: [],
  },
  [PlayGames.Golf]: { moves: ['GolfMove'], capabilities: [] },
  [PlayGames.Bomb]: { moves: ['BombMove'], capabilities: [] },
  [PlayGames.Ludo]: { moves: ['LudoMove'], capabilities: [] },
  [PlayGames.Naval]: { moves: ['NavalShot'], capabilities: [] },
}
