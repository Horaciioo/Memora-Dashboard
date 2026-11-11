import type { NavalFleet, NavalFleetColours, NavalHull } from '@/declarations/play/naval/fleets/types'

/**
 * Look of the ships of one sea, built by navalSkinOf
 * @typedef {Object} NavalSkin
 */

export interface NavalSkin extends NavalFleetColours {
  // Mine or foe band
  accent: string
  // Cache key of its paths
  key: string
  // Theatre fleet, length by ship id
  lengths: readonly number[]
  // Class by ship id
  hulls: readonly NavalHull[]
  // Classes for any other ship
  classes: NavalFleet
}

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
  flash: '#ffffff',
  exhaust: 'rgba(225,230,236,0.6)',
  blackSmoke: 'rgba(16,16,20,0.7)',
  scorch: 'rgba(22,14,8,0.6)',
  hullDark: 'rgba(8,10,14,0.38)',
  bubble: 'rgba(234,248,255,0.55)',
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
  grid: 'rgba(255,255,255,0.32)',
  sand: '#efd9a0',
  sandDark: '#c9a965',
  shallow: 'rgba(120,214,224,0.55)',
  leaf: '#2f7d3a',
  leafDark: '#1d5a2a',
  trunk: '#6b4a2b',
} as const
