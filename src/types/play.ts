import type {
  PlayBotKindName,
  PlayGameName,
  PlayInviteRoleName,
  PlayNoticeKindName,
  PlayMessageKindName,
  PlayStatusName,
} from '@/utils/constants/play'
import type { Prisma } from '@prisma/client'

/**
 * Table card read by the hubs
 * @typedef {Object} PlayLobbyCard
 */

export interface PlayLobbyCard {
  id: string
  game: PlayGameName
  hostName: string | null
  hostAvatarUrl: string | null
  players: number
  faces: { id: string; name: string; avatarUrl: string | null }[]
  status: string
  maxPlayers: number
  gamesCount: number | null
  // Followed by the reader
  isFollowed?: boolean
  // Private game an admin watches unseen
  isOverseen?: boolean
}

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
 * @property {boolean} [isCosmetic] - Only the screen moved, bots keep their plans
 */

export interface EngineStep {
  changed: boolean
  finished: boolean
  deadline: Date | null
  isCosmetic?: boolean
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
  // Same board for every reader
  isViewShared?: boolean
  // Light board read once per bot pass
  botView?: (session: EngineSession) => Promise<unknown>
  // One read, then each reader's board drawn from it
  viewFor?: (session: EngineSession) => Promise<(viewerId: string) => unknown>
  extraStats: (sessionId: string) => Promise<Map<string, Record<string, number>>>
  // XP factor of the winner
  winnerMultiplier?: (settings: Prisma.JsonValue) => number
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
 * What a member does in Play right now, read from the Play room
 * @typedef {Object} PlayPlaceState
 * @property {'playing' | 'watching'} state - Seated or watching
 * @property {string} sessionId - Game
 */

export interface PlayPlaceState {
  state: 'playing' | 'watching'
  sessionId: string
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
 * News waiting for a member: an invitation, a revenge, a followed game
 * @typedef {Object} PlayNoticeView
 */

export interface PlayNoticeView {
  id: string
  kind: PlayNoticeKindName
  sessionId: string
  game: PlayGameName
  // A call to all of Memora is only closed
  isEveryone: boolean
  // Who invites, or hosts the followed game
  actor: { name: string; avatarUrl: string | null }
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

/**
 * Member the picker can call
 * @typedef {Object} PlayInviteCandidate
 */

export interface PlayInviteCandidate extends PlayCandidate {
  // Shared a finished game with the caller
  hasPlayedWith: boolean
  // Sat at a table lately
  isRecent: boolean
}

/**
 * One finished game of a player
 * @typedef {Object} PlayHistoryEntry
 */

export interface PlayHistoryEntry {
  sessionId: string
  game: PlayGameName
  rank: number | null
  outcome: 'WIN' | 'DRAW' | 'LOSS' | null
  xp: number
  score: number
  players: number
  finishedAt: string
  // Seconds between start and end, null when never started
  durationSeconds: number | null
  // Everyone at the table, best rank first
  table: PlayHistorySeat[]
  // One counter of the viewer, shaped by the game
  fact: { key: string; value: number } | null
}

/**
 * Seat of a finished game
 * @typedef {Object} PlayHistorySeat
 */

export interface PlayHistorySeat {
  accountId: string
  name: string
  avatarUrl: string | null
  isBot: boolean
  isMe: boolean
  rank: number | null
  score: number
}

/**
 * One page of the history
 * @typedef {Object} PlayHistoryPage
 */

export interface PlayHistoryPage {
  entries: PlayHistoryEntry[]
  // Seat id to resume after, null on the last page
  nextCursor: string | null
}

/**
 * Seated player, human or bot
 * @typedef {Object} PlayPlayer
 */

export interface PlayPlayer {
  accountId: string
  botKind: PlayBotKindName | null
}

/**
 * Move a bot plans
 * @typedef {Object} PlayBotMove
 * @property {string} key - Board state it answers
 * @property {Record<string, unknown> | (() => Promise<Record<string, unknown>>)} raw - Action body
 * @property {Date} at - When to play
 */

export interface PlayBotMove {
  key: string
  // Costly bodies computed when played
  raw: Record<string, unknown> | (() => Promise<Record<string, unknown>>)
  at: Date
}

/**
 * What a bot decides from
 * @typedef {Object} PlayBotTurn
 */

export interface PlayBotTurn {
  botId: string
  level: PlayBotKindName
  settings: Prisma.JsonValue
  // Its own engine view, nothing more
  view: unknown
  now: Date
}

/**
 * Bot strategy of one game
 * @typedef {Object} PlayBotStrategy
 */

export interface PlayBotStrategy {
  decide: (turn: PlayBotTurn) => Promise<PlayBotMove | null>
}

/**
 * One record on a player sheet
 * @typedef {Object} PlayRecordView
 * @property {string} key - Stable key
 * @property {PlayGameName | null} game - Game, null when global
 * @property {string} label - What it measures
 * @property {string} value - Written value
 */

export interface PlayRecordView {
  key: string
  game: PlayGameName | null
  label: string
  value: string
}

/**
 * What a player sheet shows beyond the level and the figures
 * @typedef {Object} PlaySheetView
 */

export interface PlaySheetView {
  // Most played first
  topGames: { game: PlayGameName; played: number }[]
  records: PlayRecordView[]
  recent: PlayHistoryEntry[]
  lastSeenAt: string | null
  // Table the player sits at right now
  presence: PlayPresence | null
}

/**
 * Player of a group
 * @typedef {Object} PlayGroupMemberView
 */

export interface PlayGroupMemberView {
  accountId: string
  name: string
  avatarUrl: string | null
  isHost: boolean
  isMe: boolean
}

/**
 * Game a member would like to play
 * @typedef {Object} PlayGroupProposalView
 */

export interface PlayGroupProposalView {
  id: string
  game: PlayGameName
  by: { name: string; avatarUrl: string | null }
  isMine: boolean
}

/**
 * Group of the viewer
 * @typedef {Object} PlayGroupView
 */

export interface PlayGroupView {
  id: string
  name: string
  isHost: boolean
  members: PlayGroupMemberView[]
  // Called by the host, not answered yet
  invited: { accountId: string; name: string; avatarUrl: string | null }[]
  proposals: PlayGroupProposalView[]
  messages: PlayGroupMessageView[]
}

/**
 * Line of a group chat
 * @typedef {Object} PlayGroupMessageView
 */

export interface PlayGroupMessageView {
  id: string
  body: string
  createdAt: string
  // Game this line invites to, with its table
  game: PlayGameName | null
  sessionId: string | null
  author: { accountId: string; name: string; avatarUrl: string | null }
  isMine: boolean
}

/**
 * Call to join a group
 * @typedef {Object} PlayGroupInvitationView
 */

export interface PlayGroupInvitationView {
  id: string
  groupName: string
  host: { name: string; avatarUrl: string | null }
}

/**
 * What the group tab shows
 * @typedef {Object} PlayGroupState
 */

export interface PlayGroupState {
  groups: PlayGroupView[]
  invitations: PlayGroupInvitationView[]
}
