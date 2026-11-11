/**
 * Hull outlines a class can take
 * @type {Record<string, string>}
 */

export const NavalOutlines = {
  Bow: 'bow',
  Facet: 'facet',
  Armour: 'armour',
  Carrier: 'carrier',
  Submarine: 'submarine',
} as const

export type NavalOutline = (typeof NavalOutlines)[keyof typeof NavalOutlines]

/**
 * Deck textures
 * @type {Record<string, string>}
 */

export const NavalDecks = {
  Plain: 'plain',
  Seams: 'seams',
  Facets: 'facets',
  Plates: 'plates',
  Flight: 'flight',
} as const

export type NavalDeck = (typeof NavalDecks)[keyof typeof NavalDecks]

/**
 * Pieces standing on a deck
 * @type {Record<string, string>}
 */

export const NavalPieces = {
  Turret: 'turret',
  Bridge: 'bridge',
  Mast: 'mast',
  Vls: 'vls',
  Pad: 'pad',
  Heli: 'heli',
  Plane: 'plane',
  Tower: 'tower',
  Funnel: 'funnel',
  Sail: 'sail',
} as const

export type NavalPieceKind = (typeof NavalPieces)[keyof typeof NavalPieces]

/**
 * Whose fleet a sea shows
 * @type {Record<string, string>}
 */

export const NavalFleetSides = {
  Mine: 'mine',
  Foe: 'foe',
} as const

export type NavalFleetSide = (typeof NavalFleetSides)[keyof typeof NavalFleetSides]

/**
 * One piece on a deck
 * @typedef {Object} NavalPiece
 */

export interface NavalPiece {
  kind: NavalPieceKind
  // Share of the length from the stern
  at: number
  // Squares
  size: number
  barrels: number
  // Share of the half beam, starboard positive
  across: number
}

/**
 * One class of ship
 * @typedef {Object} NavalHull
 */

export interface NavalHull {
  outline: NavalOutline
  // Squares across
  beam: number
  deck: NavalDeck
  // Rocking speed, one is a cruiser
  sway: number
  // Only the sail above water
  isSubmerged: boolean
  // Livery stripes, share of the length
  bands: number[]
  pieces: NavalPiece[]
}

/**
 * Colours of a fleet
 * @typedef {Object} NavalFleetColours
 */

export interface NavalFleetColours {
  rim: string
  rimDark: string
  deck: string
  deckDark: string
  seam: string
  metal: string
  top: string
  dark: string
  stripe: string
  shell: string
  trail: string
}

/**
 * One fleet: colours and classes by length
 * @typedef {Object} NavalFleet
 */

export interface NavalFleet {
  colours: NavalFleetColours
  // Length to its classes, second ship of a length takes the second
  classes: Record<number, NavalHull[]>
}
