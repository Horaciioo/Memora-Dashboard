/**
 * Level skin, a colour worn from a level on
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
  { key: 'grey', label: 'Grise', from: 0 },
  { key: 'bronze', label: 'Bronze', from: 10 },
  { key: 'silver', label: 'Argentée', from: 20 },
  { key: 'gold', label: 'Dorée', from: 30 },
  { key: 'diamond', label: 'Diamantée', from: 40 },
  { key: 'emerald', label: 'Émeraude', from: 50 },
  { key: 'royalBlue', label: 'Bleu royal', from: 70 },
  { key: 'royalRed', label: 'Rouge royal', from: 91 },
]

// Frame ornaments by tens of levels inside a hundred: leaves a side, then chin and arch from a stage
export const LEVEL_FRAME = {
  tier: 100,
  step: 10,
  leaves: [0, 0, 0, 1, 2, 3, 4, 5, 6, 7],
  chinFrom: 1,
  archFrom: 2,
  maxStars: 5,
} as const

// Skin copy
export const LEVEL_SKIN_COPY = {
  badge: 'Niv. {level}',
  title: 'Niveau {level}, {skin}',
} as const
