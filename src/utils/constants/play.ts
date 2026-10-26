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

/**
 * Golf powers
 * @type {Record<string, string>}
 */

export const GolfPowers = {
  Tornado: 'tornado',
  Sticky: 'sticky',
  Ice: 'ice',
  Giant: 'giant',
  Mini: 'mini',
  AntiCollision: 'antiCollision',
  Bumper: 'bumper',
  Ghost: 'ghost',
  Gust: 'gust',
  Fart: 'fart',
  Turbo: 'turbo',
  Flash: 'flash',
  Steady: 'steady',
  Twist: 'twist',
  Mirror: 'mirror',
  Blind: 'blind',
  Lob: 'lob',
  Swap: 'swap',
} as const

export type GolfPowerName = (typeof GolfPowers)[keyof typeof GolfPowers]

/**
 * Golf formats: one map, a run of maps, or a wild map
 * @type {Record<string, string>}
 */

export const GolfModes = {
  Casual: 'casual',
  Tournament: 'tournament',
  Chaos: 'chaos',
} as const

export type GolfModeName = (typeof GolfModes)[keyof typeof GolfModes]

/**
 * Stage of a golf hole
 * @type {Record<string, string>}
 */

export const GolfPhases = {
  Countdown: 'countdown',
  Playing: 'playing',
  Closed: 'closed',
  Over: 'over',
} as const

export type GolfPhaseName = (typeof GolfPhases)[keyof typeof GolfPhases]

/**
 * Ground under a golf ball
 * @type {Record<string, string>}
 */

export const GolfSurfaces = {
  Grass: 'grass',
  Sand: 'sand',
  Ice: 'ice',
  Boost: 'boost',
  Water: 'water',
} as const

export type GolfSurfaceName = (typeof GolfSurfaces)[keyof typeof GolfSurfaces]
