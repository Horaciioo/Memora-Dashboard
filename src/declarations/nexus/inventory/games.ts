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
    capabilities: ['pause', 'resume', 'kick', 'setScore'],
  },
  [PlayGames.Golf]: { moves: ['GolfMove'], capabilities: ['pause', 'resume', 'kick', 'setScore'] },
  [PlayGames.Bomb]: { moves: ['BombMove'], capabilities: ['pause', 'resume', 'kick', 'setScore'] },
  [PlayGames.Ludo]: { moves: ['LudoMove'], capabilities: ['pause', 'resume', 'kick', 'setScore'] },
  [PlayGames.Echo]: {
    moves: ['EchoFind'],
    capabilities: ['pause', 'resume', 'kick', 'setScore'],
  },
  [PlayGames.Croquis]: {
    moves: ['CroquisGuess', 'CroquisRound'],
    capabilities: ['pause', 'resume', 'kick', 'setScore'],
  },
  [PlayGames.Glitch]: {
    moves: ['GlitchProgress'],
    capabilities: ['pause', 'resume', 'kick', 'setScore'],
  },
  [PlayGames.Jumble]: {
    moves: ['JumbleRound'],
    capabilities: ['pause', 'resume', 'kick', 'setScore'],
  },
  [PlayGames.Naval]: {
    moves: ['NavalShot'],
    capabilities: ['pause', 'resume', 'kick', 'setScore'],
  },
}
