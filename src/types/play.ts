import type {
  PlayGameName,
  PlayInviteRoleName,
  PlayMessageKindName,
  PlayStatusName,
} from '@/utils/constants/play'
import type { Prisma } from '@prisma/client'

/**
 * What an engine sees of a game
 * @typedef {Object} EngineSession
 * @property {string} id - Game
 * @property {string} hostId - Host
 * @property {Prisma.JsonValue} settings - Host choices
 * @property {string[]} players - Seated players
 */

export interface EngineSession {
  id: string
  hostId: string
  settings: Prisma.JsonValue
  players: string[]
}

/**
 * Result of one engine move
 * @typedef {Object} EngineStep
 * @property {boolean} changed - Players must refresh
 * @property {boolean} finished - Game over
 * @property {Date | null} deadline - Next timed move
 * @property {boolean} [isBoardOnly] - Only the board moved
 */

export interface EngineStep {
  changed: boolean
  finished: boolean
  deadline: Date | null
  isBoardOnly?: boolean
}

/**
 * Rules of one game
 * @typedef {Object} PlayEngine
 */

export interface PlayEngine {
  defaults: () => Prisma.InputJsonObject
  readSettings: (raw: Record<string, unknown>, current: Prisma.JsonValue) => Prisma.InputJsonObject
  start: (session: EngineSession) => Promise<EngineStep>
  act: (
    session: EngineSession,
    accountId: string,
    raw: Record<string, unknown>
  ) => Promise<EngineStep>
  settle: (session: EngineSession) => Promise<EngineStep>
  view: (session: EngineSession, viewerId: string) => Promise<unknown>
  extraStats: (sessionId: string) => Promise<Map<string, Record<string, number>>>
}

/**
 * Game a member sits in
 * @typedef {Object} PlayPresence
 */

export interface PlayPresence {
  sessionId: string
  game: PlayGameName
  status: PlayStatusName
}

/**
 * Level standing
 * @typedef {Object} PlayLevelView
 */

export interface PlayLevelView {
  level: number
  into: number
  needed: number | null
}

/**
 * Totals of one game or of all
 * @typedef {Object} PlayTotalsView
 */

export interface PlayTotalsView {
  xp: number
  level: PlayLevelView
  played: number
  wins: number
  draws: number
  losses: number
  streak?: number
  winRate?: number
}

/**
 * Counters every stat tile reads
 * @typedef {Object} PlayTileTotals
 */

export interface PlayTileTotals extends PlayTotalsView {
  bestStreak: number
  playSeconds: number
  tournamentsWon: number
}

/**
 * Levels and stats of a player
 * @typedef {Object} PlayProfileView
 */

export interface PlayProfileView {
  global: PlayTileTotals & {
    bonusXp: number
    winRate: number
    tournamentsPlayed: number
  }
  ban: { since: string; reason: string | null } | null
  games: (PlayTileTotals & { game: PlayGameName })[]
  maxLevel: number
}

/**
 * Play side of the Admin tab
 * @typedef {Object} PlayAdminState
 */

export interface PlayAdminState extends PlayProfileView {
  presence: PlayPresence | null
}

/**
 * Invitation waiting for a member
 * @typedef {Object} PlayInviteView
 */

export interface PlayInviteView {
  id: string
  sessionId: string
  game: PlayGameName
  role: PlayInviteRoleName
  isEveryone: boolean
  inviter: { name: string; avatarUrl: string | null }
  createdAt: string
}

/**
 * Row of a game ranking
 * @typedef {Object} PlayLeader
 */

export interface PlayLeader {
  rank: number
  accountId: string
  name: string
  avatarUrl: string | null
  xp: number
  level: number
  wins: number
  played: number
}

/**
 * One line of a game chat
 * @typedef {Object} PlayMessageView
 */

export interface PlayMessageView {
  id: string
  kind: PlayMessageKindName
  body: string
  createdAt: string
  author: { id: string; name: string; avatarUrl: string | null }
}

/**
 * Member who can be called to a game
 * @typedef {Object} PlayCandidate
 */

export interface PlayCandidate {
  id: string
  displayName: string
  avatarUrl: string | null
}
