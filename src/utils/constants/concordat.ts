/**
 * Terrain ids of a Concordat tile
 * @type {Record<string, number>}
 */

export const ConcordatTerrains = {
  Sea: 0,
  Coast: 1,
  Plain: 2,
  Forest: 3,
  Hill: 4,
  Mountain: 5,
  River: 6,
  Desert: 7,
} as const

export type ConcordatTerrainId = (typeof ConcordatTerrains)[keyof typeof ConcordatTerrains]

/**
 * Config key of each terrain id
 * @type {readonly string[]}
 */

export const CONCORDAT_TERRAIN_KEYS = [
  'sea',
  'coast',
  'plain',
  'forest',
  'hill',
  'mountain',
  'river',
  'desert',
] as const

export type ConcordatTerrainKey = (typeof CONCORDAT_TERRAIN_KEYS)[number]

// Dominant resource of a province
export const ConcordatResources = {
  Grain: 'grain',
  Metals: 'metals',
  Wood: 'wood',
  Stone: 'stone',
  Spices: 'spices',
} as const

export type ConcordatResourceName = (typeof ConcordatResources)[keyof typeof ConcordatResources]

// Life of a game
export const ConcordatPhases = {
  Picking: 'PICKING',
  Playing: 'PLAYING',
  Ended: 'ENDED',
} as const

export type ConcordatPhaseName = (typeof ConcordatPhases)[keyof typeof ConcordatPhases]

// Player commands
export const ConcordatIntents = {
  Engage: 'engage',
  Retreat: 'retreat',
  PlaceStart: 'placeStart',
  Build: 'build',
  Upgrade: 'upgrade',
  BuildShip: 'buildShip',
  MoveShip: 'moveShip',
  Sail: 'sail',
  Propose: 'propose',
  OpenTrade: 'openTrade',
  Accept: 'accept',
  Refuse: 'refuse',
  Break: 'break',
  Gift: 'gift',
  Aid: 'aid',
  CloseTrade: 'closeTrade',
  Research: 'research',
  Feint: 'feint',
  Launch: 'launch',
  Sortie: 'sortie',
} as const

export type ConcordatIntentKind = (typeof ConcordatIntents)[keyof typeof ConcordatIntents]

// Game speed
export const ConcordatSpeeds = {
  Relaxed: 'relaxed',
  Normal: 'normal',
  Fast: 'fast',
} as const

export type ConcordatSpeedName = (typeof ConcordatSpeeds)[keyof typeof ConcordatSpeeds]

// What kind of power holds the land
export const ConcordatPowers = {
  Human: 'human',
  Country: 'country',
  Tribe: 'tribe',
} as const

export type ConcordatPowerName = (typeof ConcordatPowers)[keyof typeof ConcordatPowers]

// How strong the AI countries start
export const ConcordatDifficulties = {
  Easy: 'easy',
  Normal: 'normal',
  Hard: 'hard',
} as const

export type ConcordatDifficultyName =
  (typeof ConcordatDifficulties)[keyof typeof ConcordatDifficulties]

// Map size
export const ConcordatSizes = {
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
} as const

export type ConcordatSizeName = (typeof ConcordatSizes)[keyof typeof ConcordatSizes]

// Map region of the real world
export const ConcordatStyles = {
  World: 'world',
  Europe: 'europe',
  Asia: 'asia',
  Africa: 'africa',
  Americas: 'americas',
  Mediterranean: 'mediterranean',
  Oceania: 'oceania',
} as const

export type ConcordatStyleName = (typeof ConcordatStyles)[keyof typeof ConcordatStyles]

// Region drawn at launch
export const CONCORDAT_RANDOM_STYLE = 'random'

export type ConcordatStyleChoice = ConcordatStyleName | typeof CONCORDAT_RANDOM_STYLE

// Strategic spots
export const ConcordatChokes = {
  Strait: 'strait',
  Isthmus: 'isthmus',
  Pass: 'pass',
} as const

export type ConcordatChokeKind = (typeof ConcordatChokes)[keyof typeof ConcordatChokes]

// Buildings a nation can raise
export const ConcordatBuildingKinds = {
  Market: 'market',
  Barracks: 'barracks',
  Fortress: 'fortress',
  Port: 'port',
  Silo: 'silo',
  Observatory: 'observatory',
  Post: 'post',
  Sam: 'sam',
  Airbase: 'airbase',
  Battery: 'battery',
} as const

export type ConcordatBuildingKind =
  (typeof ConcordatBuildingKinds)[keyof typeof ConcordatBuildingKinds]

/**
 * Building kinds in wire order
 * @type {readonly ConcordatBuildingKind[]}
 */

export const CONCORDAT_BUILDING_ORDER: readonly ConcordatBuildingKind[] = [
  'market',
  'barracks',
  'fortress',
  'port',
  'silo',
  'observatory',
  'post',
  'sam',
  'airbase',
  'battery',
]

// Ships of a port
export const ConcordatShipKinds = {
  Transport: 'transport',
  War: 'war',
  Trade: 'trade',
} as const

export type ConcordatShipKind = (typeof ConcordatShipKinds)[keyof typeof ConcordatShipKinds]

// What links two nations
export const ConcordatTies = {
  Hostile: 'hostile',
  Peace: 'peace',
  Alliance: 'alliance',
} as const

export type ConcordatTieKind = (typeof ConcordatTies)[keyof typeof ConcordatTies]

/**
 * Tie kinds in wire order
 * @type {readonly ConcordatTieKind[]}
 */

export const CONCORDAT_TIE_ORDER: readonly ConcordatTieKind[] = ['hostile', 'peace', 'alliance']

// What an offer proposes
export const ConcordatOfferKinds = {
  Peace: 'peace',
  Alliance: 'alliance',
  Trade: 'trade',
  Request: 'request',
  Coalition: 'coalition',
} as const

export type ConcordatOfferKind = (typeof ConcordatOfferKinds)[keyof typeof ConcordatOfferKinds]

/**
 * Offer kinds in wire order
 * @type {readonly ConcordatOfferKind[]}
 */

export const CONCORDAT_OFFER_ORDER: readonly ConcordatOfferKind[] = [
  'peace',
  'alliance',
  'trade',
  'request',
  'coalition',
]

// Short asks of a request
export const ConcordatAsks = {
  Attack: 0,
  Passage: 1,
  Gold: 2,
  Troops: 3,
} as const

export type ConcordatAskId = (typeof ConcordatAsks)[keyof typeof ConcordatAsks]

// Trade route shapes
export const ConcordatRouteKinds = {
  Land: 'land',
  Sea: 'sea',
} as const

export type ConcordatRouteKind = (typeof ConcordatRouteKinds)[keyof typeof ConcordatRouteKinds]

// Journal line kinds
export const ConcordatEventKinds = [
  'started',
  'capitalTaken',
  'eliminated',
  'ended',
  'treaty',
  'broken',
  'betrayal',
  'coalition',
  'landed',
  'sunk',
  'built',
  'researched',
  'launched',
  'impact',
  'intercepted',
  'announce',
  'worldEnd',
  'revolt',
  'collapse',
  'domination',
  'dominationLost',
  'teamsDrawn',
  'zoneWon',
  'sortie',
  'shotDown',
] as const

export type ConcordatEventKind = (typeof ConcordatEventKinds)[number]

// Technology paths
export const ConcordatTechPaths = {
  Economy: 'economy',
  Army: 'army',
  Defense: 'defense',
  Navy: 'navy',
  Diplomacy: 'diplomacy',
} as const

export type ConcordatTechPath = (typeof ConcordatTechPaths)[keyof typeof ConcordatTechPaths]

/**
 * Paths in wire order
 * @type {readonly ConcordatTechPath[]}
 */

export const CONCORDAT_TECH_ORDER: readonly ConcordatTechPath[] = [
  'economy',
  'army',
  'defense',
  'navy',
  'diplomacy',
]

// Strategic weapons
export const ConcordatStrikeKinds = {
  Missile: 'missile',
  Heavy: 'heavy',
  Shell: 'shell',
  Rocket: 'rocket',
} as const

export type ConcordatStrikeKind = (typeof ConcordatStrikeKinds)[keyof typeof ConcordatStrikeKinds]

/**
 * Strike kinds in wire order
 * @type {readonly ConcordatStrikeKind[]}
 */

export const CONCORDAT_STRIKE_ORDER: readonly ConcordatStrikeKind[] =
  Object.values(ConcordatStrikeKinds)

/**
 * Weapons a host can switch off, in arsenal order
 * @type {readonly string[]}
 */

export const CONCORDAT_WEAPONS = ['missile', 'heavy', 'shell', 'rocket', 'heli', 'fighter'] as const

export type ConcordatWeaponName = (typeof CONCORDAT_WEAPONS)[number]

// Aircraft a base sends up
export const ConcordatAirKinds = {
  Heli: 'heli',
  Fighter: 'fighter',
} as const

export type ConcordatAirKind = (typeof ConcordatAirKinds)[keyof typeof ConcordatAirKinds]

// Scars the fights leave on the ground
export const ConcordatScarKinds = {
  Blast: 'blast',
  Flak: 'flak',
  Wreck: 'wreck',
  Strafe: 'strafe',
} as const

export type ConcordatScarKind = (typeof ConcordatScarKinds)[keyof typeof ConcordatScarKinds]

// Marked ground
export const ConcordatZoneKinds = {
  Fallout: 'fallout',
  Quake: 'quake',
  Flood: 'flood',
  Storm: 'storm',
} as const

export type ConcordatZoneKind = (typeof ConcordatZoneKinds)[keyof typeof ConcordatZoneKinds]

// Shocks that strike the world
export const ConcordatWorldKinds = {
  Crisis: 'crisis',
  Harvest: 'harvest',
  Revolt: 'revolt',
  Disaster: 'disaster',
  Tension: 'tension',
} as const

export type ConcordatWorldKind = (typeof ConcordatWorldKinds)[keyof typeof ConcordatWorldKinds]

/**
 * World shocks in wire order
 * @type {readonly ConcordatWorldKind[]}
 */

export const CONCORDAT_WORLD_ORDER: readonly ConcordatWorldKind[] = [
  'crisis',
  'harvest',
  'revolt',
  'disaster',
  'tension',
]

// Game formats
export const ConcordatModes = {
  Free: 'free',
  Teams: 'teams',
  Rotating: 'rotating',
  Ranked: 'ranked',
  Relaxed: 'relaxed',
} as const

export type ConcordatModeName = (typeof ConcordatModes)[keyof typeof ConcordatModes]

// How a game ends
export const ConcordatEnds = {
  Last: 'last',
  Domination: 'domination',
  Time: 'time',
} as const

export type ConcordatEndName = (typeof ConcordatEnds)[keyof typeof ConcordatEnds]

// How sharp a bot plays
export const ConcordatBotLevels = {
  Recruit: 'recruit',
  Strategist: 'strategist',
  Raptor: 'raptor',
} as const

export type ConcordatBotLevelName = (typeof ConcordatBotLevels)[keyof typeof ConcordatBotLevels]

// How a bot treats the others
export const ConcordatBotPersonalities = {
  Merchant: 'merchant',
  Fortress: 'fortress',
  Conqueror: 'conqueror',
  Loyal: 'loyal',
  Opportunist: 'opportunist',
} as const

export type ConcordatBotPersonalityName =
  (typeof ConcordatBotPersonalities)[keyof typeof ConcordatBotPersonalities]

// Gestures offered on a nation
export const ConcordatTargetActions = {
  Attack: 'attack',
  Peace: 'peace',
  Alliance: 'alliance',
  Trade: 'trade',
  Aid: 'aid',
  Break: 'break',
} as const

export type ConcordatTargetAction =
  (typeof ConcordatTargetActions)[keyof typeof ConcordatTargetActions]
