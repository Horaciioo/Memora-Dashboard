/**
 * Level skin, a laurel worn for fifty levels
 * @typedef {Object} LevelSkin
 * @property {string} key - Skin key, read by skins.css
 * @property {string} label - Display name
 * @property {number} from - First level wearing it
 */

export interface LevelSkin {
  key: string
  label: string
  from: number
}

/**
 * Skins by ascending level
 * @type {LevelSkin[]}
 */

export const LEVEL_SKINS: LevelSkin[] = [
  { key: 'bronze', label: 'Bronze', from: 0 },
  { key: 'silver', label: 'Argent', from: 51 },
  { key: 'gold', label: 'Or', from: 101 },
  { key: 'platinum', label: 'Platine', from: 151 },
  { key: 'emerald', label: 'Émeraude', from: 201 },
  { key: 'diamond', label: 'Diamant', from: 251 },
  { key: 'master', label: 'Maître', from: 301 },
  { key: 'legend', label: 'Légende', from: 351 },
]

// Five frames per metal, one every ten levels
export const LEVEL_FRAME = {
  span: 50,
  step: 10,
} as const

// Skin copy
export const LEVEL_SKIN_COPY = {
  badge: 'Niv. {level}',
  title: 'Niveau {level}, {skin}',
} as const
