/**
 * The one look of ships and shells, read by the painters
 * @typedef {Object} NavalSkin
 */

export interface NavalSkin {
  rim: string
  rimDark: string
  wood: string
  woodDark: string
  plank: string
  metal: string
  top: string
  dark: string
  accent: string
  shell: string
  trail: string
}

/**
 * Top-down warships, a metal rim around a wooden deck
 * @type {NavalSkin}
 */

export const NAVAL_SKIN: NavalSkin = {
  rim: '#d4dbe1',
  rimDark: '#7e8995',
  wood: '#9b6b3c',
  woodDark: '#6f4724',
  plank: 'rgba(40,22,8,0.35)',
  metal: '#aeb8c2',
  top: '#eef2f5',
  dark: '#3f4954',
  accent: '#e0452f',
  shell: '#2b2f36',
  trail: 'rgba(255,255,255,0.55)',
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
