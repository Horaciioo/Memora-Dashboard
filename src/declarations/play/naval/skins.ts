/**
 * Shape of a bow
 * @type {Record<string, string>}
 */

export const NavalBows = {
  Pointed: 'pointed',
  Round: 'round',
  Square: 'square',
} as const

export type NavalBowName = (typeof NavalBows)[keyof typeof NavalBows]

/**
 * What stands on a deck
 * @type {Record<string, string>}
 */

export const NavalRigs = {
  Turrets: 'turrets',
  Masts: 'masts',
  Fins: 'fins',
  Studs: 'studs',
} as const

export type NavalRigName = (typeof NavalRigs)[keyof typeof NavalRigs]

/**
 * Look of the ships and shells, read by the painter
 * @typedef {Object} NavalSkin
 */

export interface NavalSkin {
  label: string
  hull: string
  deck: string
  top: string
  dark: string
  accent: string
  shell: string
  trail: string
  bow: NavalBowName
  rig: NavalRigName
  // Glow around hull and shells
  glow: string | null
}

/**
 * Skins, all open from the start
 * @type {Record<string, NavalSkin>}
 */

export const NAVAL_SKINS = {
  classic: {
    label: 'Marine',
    hull: '#9aa7b4',
    deck: '#c9d3dc',
    top: '#e4ebf1',
    dark: '#4d5965',
    accent: '#ffcf5a',
    shell: '#2b2f36',
    trail: 'rgba(255,255,255,0.55)',
    bow: NavalBows.Pointed,
    rig: NavalRigs.Turrets,
    glow: null,
  },
  pirate: {
    label: 'Pirate',
    hull: '#6b4226',
    deck: '#a8743f',
    top: '#f1e6cf',
    dark: '#2a1a10',
    accent: '#c0392b',
    shell: '#1a1a1a',
    trail: 'rgba(90,90,90,0.6)',
    bow: NavalBows.Round,
    rig: NavalRigs.Masts,
    glow: null,
  },
  future: {
    label: 'Futuriste',
    hull: '#1d2533',
    deck: '#2f3b52',
    top: '#4ad8ff',
    dark: '#0b0f17',
    accent: '#ff4fd8',
    shell: '#bff6ff',
    trail: 'rgba(74,216,255,0.75)',
    bow: NavalBows.Pointed,
    rig: NavalRigs.Fins,
    glow: '#4ad8ff',
  },
  toy: {
    label: 'Jouet',
    hull: '#e63946',
    deck: '#ffd23f',
    top: '#3a86ff',
    dark: '#1d3557',
    accent: '#06d6a0',
    shell: '#ff8fab',
    trail: 'rgba(255,143,171,0.7)',
    bow: NavalBows.Square,
    rig: NavalRigs.Studs,
    glow: null,
  },
} as const satisfies Record<string, NavalSkin>

export type NavalSkinName = keyof typeof NAVAL_SKINS

// Skin before any choice
export const NAVAL_SKIN_DEFAULT: NavalSkinName = 'classic'

/**
 * Colours of the water and its marks
 * @type {Object}
 */

export const NAVAL_WATER = {
  deep: '#06243b',
  mid: '#0d4468',
  light: '#1f7aa8',
  sheen: 'rgba(170,225,255,0.10)',
  foam: '#eaf8ff',
  line: 'rgba(170,225,255,0.22)',
  zone: 'rgba(255,226,122,0.28)',
  zoneEdge: '#ffe27a',
  bad: 'rgba(255,80,80,0.35)',
  good: 'rgba(120,255,170,0.30)',
  fire: '#ffb02e',
  hit: '#ff5a36',
  smoke: 'rgba(40,42,48,0.55)',
  spotted: '#ffe27a',
  clear: 'rgba(234,248,255,0.35)',
  flare: 'rgba(255,240,190,0.35)',
  shadow: 'rgba(0,0,0,0.35)',
  wake: 'rgba(234,248,255,0.7)',
  plane: '#2a3340',
  view: 'rgba(255,255,255,0.85)',
  map: 'rgba(4,17,29,0.78)',
} as const
