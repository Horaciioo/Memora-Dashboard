import type {
  ConcordatAirKind,
  ConcordatScarKind,
  ConcordatBotLevelName,
  ConcordatPowerName,
  ConcordatBotPersonalityName,
  ConcordatBuildingKind,
  ConcordatChokeKind,
  ConcordatEventKind,
  ConcordatDifficultyName,
  ConcordatModeName,
  ConcordatStrikeKind,
  ConcordatTechPath,
  ConcordatWorldKind,
  ConcordatZoneKind,
  ConcordatOfferKind,
  ConcordatRouteKind,
  ConcordatShipKind,
  ConcordatTieKind,
  ConcordatPhaseName,
  ConcordatResourceName,
  ConcordatStyleName,
  ConcordatWeaponName,
} from '@/utils/constants/concordat'

/**
 * Named group of tiles
 * @typedef {Object} ConcordatProvince
 */

export interface ConcordatProvince {
  // From one, zero is the sea
  id: number
  name: string
  resource: ConcordatResourceName
  tiles: number
  // Centre tile
  x: number
  y: number
}

/**
 * Generated map, tile arrays are row-major
 * @typedef {Object} ConcordatMap
 */

export interface ConcordatMap {
  width: number
  height: number
  seed: number
  style: ConcordatStyleName
  terrain: Uint8Array
  province: Uint16Array
  // Index is the province id minus one
  provinces: ConcordatProvince[]
  // Fair start tiles, best spread first
  starts: number[]
}

/**
 * Strategic spots of a map
 * @typedef {Record<ConcordatChokeKind, number[]>} ConcordatChokepoints
 */

export type ConcordatChokepoints = Record<ConcordatChokeKind, number[]>

/**
 * Nation in play, index is the id minus one
 * @typedef {Object} ConcordatPlayerState
 */

export interface ConcordatPlayerState {
  // From one, same byte as the owner layer
  id: number
  // Null for a bot
  accountId: string | null
  alive: boolean
  troops: number
  gold: number
  tiles: number
  // Gold per second of the terrain held
  income: number
  provincesHeld: number
  // 0 to 100
  stability: number
  // Tile, minus one once lost
  capital: number
  start: number
  protectedUntil: number
  eliminatedAt: number
  // Border tiles, rebuilt from the owner layer
  front: Set<number>
  // Human seat, real country or wild tribe
  kind: ConcordatPowerName
  // Shown name of a country or tribe, empty for a seat
  name: string
  // Packed RGB, zero for the palette
  color: number
  // Shares of the troop ceiling, growth and income
  capShare: number
  growthShare: number
  goldShare: number
  // Bot level of a country, absent otherwise
  level?: ConcordatBotLevelName
}

/**
 * Troops pushing into a target
 * @typedef {Object} ConcordatCorps
 */

export interface ConcordatCorps {
  id: number
  owner: number
  // Player id, zero for free land
  target: number
  troops: number
  // Fraction of the next tile
  progress: number
  // Share of the reserve sent, 0 to 1, sets the pace
  drive?: number
  // End tick of a feint, absent on a real push
  feint?: number
  // Free land tile the push heads for
  aim?: number
  // Province the push works on, it stops once whole
  zone?: number
}

/**
 * Something worth a journal line
 * @typedef {Object} ConcordatEvent
 */

export interface ConcordatEvent {
  tick: number
  kind: ConcordatEventKind
  actor: number
  victim: number
  // Tile, or a detail code for treaties and buildings
  tile: number
}

/**
 * Building on a tile
 * @typedef {Object} ConcordatBuilding
 */

export interface ConcordatBuilding {
  id: number
  owner: number
  kind: ConcordatBuildingKind
  level: number
  tile: number
  // Tick when it works, later than now while built or repaired
  readyAt: number
  // Tick a battery is ready to fire again
  coolAt?: number
}

/**
 * Ship at sea
 * @typedef {Object} ConcordatShip
 */

export interface ConcordatShip {
  id: number
  owner: number
  kind: ConcordatShipKind
  // Sea tile now
  tile: number
  // Sea tiles still to cross
  path: number[]
  // Troops aboard, zero for a warship
  troops: number
  // Land tile to land on, minus one for a warship
  landing: number
  // Ticks a warship may stay without a port
  ttl: number
  // Building id of the home port
  port: number
  // Fraction of the next tile crossed
  progress: number
  // Port building a cargo ship sails to
  dest?: number
}

/**
 * Tie between two nations, a is the lower id
 * @typedef {Object} ConcordatRelation
 */

export interface ConcordatRelation {
  a: number
  b: number
  kind: ConcordatTieKind
  since: number
  // End tick of a peace, zero when open
  until: number
  // Tick a announced break takes effect, zero when none
  breakAt: number
  // Tick of the last reinforcements sent by the lower and by the higher nation
  aidA?: number
  aidB?: number
}

/**
 * Proposal waiting for an answer
 * @typedef {Object} ConcordatOffer
 */

export interface ConcordatOffer {
  id: number
  from: number
  to: number
  kind: ConcordatOfferKind
  // Peace length
  minutes: number
  // Request wording
  ask: number
  // Third nation of a request or coalition
  about: number
  expiresAt: number
}

/**
 * Trade route between two buildings
 * @typedef {Object} ConcordatRoute
 */

export interface ConcordatRoute {
  id: number
  a: number
  b: number
  buildingA: number
  buildingB: number
  kind: ConcordatRouteKind
  since: number
  // Sea tiles crossed, empty on land
  path: number[]
  // Straight length in tiles
  length: number
  // War or blockade stops the income
  isCut: boolean
  // Born of an alliance, ends with it
  isAlliance?: boolean
}

/**
 * Nations joined against a fallen one
 * @typedef {Object} ConcordatCoalition
 */

export interface ConcordatCoalition {
  id: number
  target: number
  members: number[]
  until: number
}

/**
 * Effects of the buildings of one nation
 * @typedef {Object} ConcordatEffects
 */

export interface ConcordatEffects {
  gold: number
  cap: number
  growth: number
  calm: number
  upkeep: number
  // Ships a nation may hold
  ships: number
  // Fortresses at work
  fortresses: { tile: number; radius: number; defense: number }[]
  // Trade income of this tick, gold per second
  trade: number
  // Factor on the earnings, one when untouched
  income: number
  // Added to the defense factor of every tile
  defense: number
  // Share of missiles stopped near the nation
  intercept: number
  shipSpeed: number
  trustGain: number
  // Longer peace, share
  peace: number
  // Added to the blockade reach of warships
  blockade: number
  // Share of the land upkeep spared
  upkeepCut: number
  canFeint: boolean
  // Gold per second lost to marked ground
  malus: number
}

/**
 * Research state of a nation
 * @typedef {Object} ConcordatTech
 */

export interface ConcordatTech {
  // Tiers reached, in path order
  levels: number[]
  // Path being researched, minus one when idle
  path: number
  // Tick the research ends
  readyAt: number
}

/**
 * Missile in flight
 * @typedef {Object} ConcordatStrike
 */

export interface ConcordatStrike {
  id: number
  owner: number
  kind: ConcordatStrikeKind
  tile: number
  // Silo tile, absent on older saves
  from?: number
  launchedAt: number
  impactAt: number
  // Battery tile of the last interceptor fired, minus one when none
  by?: number
  // Tick the last interceptor left
  shotAt?: number
  // Tick the strike is shot down, zero when it flies on
  killAt?: number
}

/**
 * Aircraft of a nation: a helicopter on guard or a fighter on a sortie
 * @typedef {Object} ConcordatAircraft
 */

export interface ConcordatAircraft {
  id: number
  owner: number
  kind: ConcordatAirKind
  // Airbase tile
  base: number
  // Guard tile or target tile
  tile: number
  launchedAt: number
  // Tick it is back on the ground
  until: number
  hp: number
  // Last shot taken and the tile it came from, minus one when none
  shotAt: number
  shotFrom: number
  // Fighter strafed already
  isDone?: boolean
}

/**
 * Scar left on the ground by a fight
 * @typedef {Object} ConcordatScar
 */

export interface ConcordatScar {
  tile: number
  radius: number
  at: number
  kind: ConcordatScarKind
}

/**
 * Marked ground, a fallout or a disaster
 * @typedef {Object} ConcordatZone
 */

export interface ConcordatZone {
  id: number
  kind: ConcordatZoneKind
  tile: number
  radius: number
  until: number
}

/**
 * Missiles of a nation
 * @typedef {Object} ConcordatArms
 */

export interface ConcordatArms {
  missiles: number
  // Heavy weapons already fired
  heavy: number
  // Tick the next missile is ready
  nextAt: number
}

/**
 * World shock announced, then applied, then over
 * @typedef {Object} ConcordatShock
 */

export interface ConcordatShock {
  kind: ConcordatWorldKind
  // Nations touched
  targets: number[]
  // Province for a revolt, zero otherwise
  province: number
  // Centre of a disaster zone, minus one otherwise
  tile: number
  zone: ConcordatZoneKind
  startsAt: number
  endsAt: number
  isApplied: boolean
}

/**
 * Pacing of world shocks
 * @typedef {Object} ConcordatWorld
 */

export interface ConcordatWorld {
  // Tick of the next draw, zero before the first
  nextAt: number
  active: ConcordatShock | null
  // Nations warned of a collapse
  warned: number[]
}

/**
 * Nation, or team, holding the map
 * @typedef {Object} ConcordatDomination
 */

export interface ConcordatDomination {
  // Side key, zero when nobody
  side: number
  since: number
}

/**
 * Population sample of the whole game
 * @typedef {Object} ConcordatSample
 */

export interface ConcordatSample {
  tick: number
  tiles: number[]
}

/**
 * Live game
 * @typedef {Object} ConcordatState
 */

export interface ConcordatState {
  map: ConcordatMap
  phase: ConcordatPhaseName
  tick: number
  // Rates factor
  speed: number
  pickEnd: number
  endTick: number
  protectionTicks: number
  rng: number
  owner: Uint8Array
  players: ConcordatPlayerState[]
  corps: ConcordatCorps[]
  // Tiles held per player and province
  provinceCounts: Uint16Array
  nextCorpsId: number
  events: ConcordatEvent[]
  // Tiles changed since the last drain
  changed: number[]
  // Ids of buildings, ships, offers, routes and coalitions
  nextId: number
  buildings: ConcordatBuilding[]
  ships: ConcordatShip[]
  relations: ConcordatRelation[]
  offers: ConcordatOffer[]
  routes: ConcordatRoute[]
  coalitions: ConcordatCoalition[]
  // Public credit per player, index is the id minus one
  trust: number[]
  // Rebuilt every tick from the buildings, never stored
  effects: ConcordatEffects[]
  // Territory over time and every journal line
  history: ConcordatSample[]
  log: ConcordatEvent[]
  mode: ConcordatModeName
  // Weapons allowed in this game
  weapons: ConcordatWeaponName[]
  // Temper of the AI powers, normal when missing
  temper?: ConcordatDifficultyName
  // Teams drawn at the start, zero when none
  teamCount: number
  // Team of each nation, zero for none, index is the id minus one
  teams: number[]
  // Tick of the next team draw, zero when fixed
  nextDrawAt: number
  techs: ConcordatTech[]
  strikes: ConcordatStrike[]
  aircraft: ConcordatAircraft[]
  scars: ConcordatScar[]
  zones: ConcordatZone[]
  arms: ConcordatArms[]
  world: ConcordatWorld
  domination: ConcordatDomination
  // Slow parts changed since the last diff
  isSystemsDirty: boolean
  isOffersDirty: boolean
}

/**
 * Command of a player
 * @typedef {Object} ConcordatIntent
 */

export type ConcordatIntent =
  | { kind: 'engage'; playerId: number; target: number; percent: number; tile?: number }
  | { kind: 'feint'; playerId: number; target: number; percent: number }
  | { kind: 'research'; playerId: number; path: ConcordatTechPath }
  | {
      kind: 'launch'
      playerId: number
      silo: number
      tile: number
      heavy: boolean
      // Shell or rocket from a battery, missing for a silo missile
      weapon?: 'shell' | 'rocket'
    }
  | { kind: 'sortie'; playerId: number; base: number; tile: number; air: ConcordatAirKind }
  | { kind: 'retreat'; playerId: number; target: number }
  | { kind: 'placeStart'; playerId: number; tile: number }
  | { kind: 'build'; playerId: number; building: ConcordatBuildingKind; tile: number }
  | { kind: 'upgrade'; playerId: number; id: number }
  | { kind: 'buildShip'; playerId: number; port: number }
  | { kind: 'moveShip'; playerId: number; ship: number; tile: number }
  | { kind: 'sail'; playerId: number; port: number; tile: number; percent: number }
  | {
      kind: 'propose'
      playerId: number
      to: number
      offer: ConcordatOfferKind
      minutes: number
      ask: number
      about: number
    }
  | { kind: 'accept'; playerId: number; offer: number }
  | { kind: 'refuse'; playerId: number; offer: number }
  | { kind: 'break'; playerId: number; with: number }
  | { kind: 'aid'; playerId: number; to: number; percent: number }
  | { kind: 'gift'; playerId: number; to: number; resource: 'gold' | 'troops'; amount: number }
  | { kind: 'closeTrade'; playerId: number; with: number }

/**
 * How one bot plays, level and personality merged
 * @typedef {Object} ConcordatBotProfile
 */

export interface ConcordatBotProfile {
  level: ConcordatBotLevelName
  personality: ConcordatBotPersonalityName
  // Seconds between two decisions, min then max
  thinkSeconds: number[]
  // Share of troops sent on free land and on a rival
  freePercent: number
  attackPercent: number
  // Troops needed over the rival's before attacking
  needRatio: number
  // Share of troops kept home
  reserve: number
  // Share of the troop ceiling that wakes a push
  trigger: number
  maxBuildings: number
  // 1 when it researches, sails, betrays or reads opportunities
  researches: number
  answers: number
  betrays: number
  sails: number
  opportunity: number
  build: ConcordatBuildingKind[]
  techPath: ConcordatTechPath
  // Weights of the personality
  aggression: number
  trade: number
  loyalty: number
  betray: number
  alliance: number
}
