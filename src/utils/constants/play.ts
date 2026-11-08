/**
 * Games of Memora Play
 * @type {Record<string, string>}
 */

export const PlayGames = {
  Baccalaureat: 'BACCALAUREAT',
  Golf: 'GOLF',
  Bomb: 'BOMB',
  Ludo: 'LUDO',
  Naval: 'NAVAL',
} as const

export type PlayGameName = (typeof PlayGames)[keyof typeof PlayGames]

// Play bot levels
export const PlayBotKinds = {
  Easy: 'EASY',
  Medium: 'MEDIUM',
  Hard: 'HARD',
} as const

export type PlayBotKindName = (typeof PlayBotKinds)[keyof typeof PlayBotKinds]

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
 * Kinds of Play notice
 * @type {Record<string, string>}
 */

export const PlayNoticeKinds = {
  Invite: 'invite',
  Spectate: 'spectate',
  Rematch: 'rematch',
  Started: 'started',
  Finished: 'finished',
} as const

export type PlayNoticeKindName = (typeof PlayNoticeKinds)[keyof typeof PlayNoticeKinds]

/**
 * Who finds a game in the lists
 * @type {Record<string, string>}
 */

export const PlayVisibilities = {
  Public: 'PUBLIC',
  Private: 'PRIVATE',
} as const

export type PlayVisibilityName = (typeof PlayVisibilities)[keyof typeof PlayVisibilities]

/**
 * What a chat line is
 * @type {Record<string, string>}
 */

export const PlayMessageKinds = {
  Text: 'TEXT',
  Joined: 'JOINED',
  Left: 'LEFT',
  Kicked: 'KICKED',
  Requested: 'REQUESTED',
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
  Flash: 'flash',
  Steady: 'steady',
  Twist: 'twist',
  Mirror: 'mirror',
  Blind: 'blind',
  Lob: 'lob',
  BumperMan: 'bumperMan',
  BoingBoing: 'boingBoing',
  Teleport: 'teleport',
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

/**
 * Ways to play a naval battle
 * @type {Record<string, string>}
 */

export const NavalModes = {
  Duel: 'duel',
  Bracket: 'bracket',
  Melee: 'melee',
} as const

export type NavalModeName = (typeof NavalModes)[keyof typeof NavalModes]

/**
 * Stage of a naval battle
 * @type {Record<string, string>}
 */

export const NavalPhases = {
  Placement: 'PLACEMENT',
  Battle: 'BATTLE',
  Over: 'OVER',
} as const

export type NavalPhaseName = (typeof NavalPhases)[keyof typeof NavalPhases]

/**
 * What a shell did
 * @type {Record<string, string>}
 */

export const NavalResults = {
  Miss: 'MISS',
  Hit: 'HIT',
  Sunk: 'SUNK',
  Spotted: 'SPOTTED',
  Clear: 'CLEAR',
} as const

export type NavalResultName = (typeof NavalResults)[keyof typeof NavalResults]

/**
 * Weapons of a naval battle, in catalogue order
 * @type {Record<string, string>}
 */

export const NavalWeapons = {
  Cannon: 'cannon',
  Airstrike: 'airstrike',
  Broadside: 'broadside',
  Flare: 'flare',
  Torpedo: 'torpedo',
} as const

export type NavalWeaponName = (typeof NavalWeapons)[keyof typeof NavalWeapons]

/**
 * Footprint of a weapon on the sea
 * @type {Record<string, string>}
 */

export const NavalShapes = {
  Point: 'point',
  Line: 'line',
  Cross: 'cross',
  Square: 'square',
  Ray: 'ray',
} as const

export type NavalShapeName = (typeof NavalShapes)[keyof typeof NavalShapes]
