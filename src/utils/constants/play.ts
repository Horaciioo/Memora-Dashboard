/**
 * Games of Memora Play
 * @type {Record<string, string>}
 */

export const PlayGames = {
  Baccalaureat: 'BACCALAUREAT',
  Golf: 'GOLF',
  Bomb: 'BOMB',
  Ludo: 'LUDO',
} as const

export type PlayGameName = (typeof PlayGames)[keyof typeof PlayGames]

/**
 * Life of a game
 * @type {Record<string, string>}
 */

export const PlayStatuses = {
  Lobby: 'LOBBY',
  Running: 'RUNNING',
  Finished: 'FINISHED',
  Abandoned: 'ABANDONED',
} as const

export type PlayStatusName = (typeof PlayStatuses)[keyof typeof PlayStatuses]

/**
 * Statuses still holding their players
 * @type {readonly PlayStatusName[]}
 */

export const PLAY_OPEN_STATUSES: readonly PlayStatusName[] = [
  PlayStatuses.Lobby,
  PlayStatuses.Running,
]

/**
 * How a player ended a game
 * @type {Record<string, string>}
 */

export const PlayOutcomes = {
  Win: 'WIN',
  Draw: 'DRAW',
  Loss: 'LOSS',
} as const

export type PlayOutcomeName = (typeof PlayOutcomes)[keyof typeof PlayOutcomes]

/**
 * Seats an invitation offers
 * @type {Record<string, string>}
 */

export const PlayInviteRoles = {
  Player: 'PLAYER',
  Spectator: 'SPECTATOR',
} as const

export type PlayInviteRoleName = (typeof PlayInviteRoles)[keyof typeof PlayInviteRoles]

/**
 * What a chat line is
 * @type {Record<string, string>}
 */

export const PlayMessageKinds = {
  Text: 'TEXT',
  Joined: 'JOINED',
  Left: 'LEFT',
  Kicked: 'KICKED',
} as const

export type PlayMessageKindName = (typeof PlayMessageKinds)[keyof typeof PlayMessageKinds]
