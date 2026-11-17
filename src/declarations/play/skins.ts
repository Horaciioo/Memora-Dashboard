/**
 * Level skin, a metal worn for fifty levels
 * @typedef {Object} LevelSkin
 * @property {string} key - Skin key, read by skins.css
 * @property {string} label - Display name
 * @property {number} from - First level wearing it
 * @property {number} fx - Effects tier, 0 none to 4 rays
 */

export interface LevelSkin {
  key: string
  label: string
  from: number
  fx: number
}

/**
 * Ornaments of one ten-level step inside a metal
 * @typedef {Object} FrameStep
 * @property {number} wing - Feathers per wing
 * @property {number} crest - Leaves on top
 * @property {boolean} studs - Rivets on the corners
 * @property {boolean} ring - Outer line ring
 * @property {boolean} gem - Gem on the crown
 */

export interface FrameStep {
  wing: number
  crest: number
  studs: boolean
  ring: boolean
  gem: boolean
}

/**
 * Skins by ascending level
 * @type {LevelSkin[]}
 */

export const LEVEL_SKINS: LevelSkin[] = [
  { key: 'bronze', label: 'Bronze', from: 0, fx: 0 },
  { key: 'silver', label: 'Argent', from: 51, fx: 0 },
  { key: 'gold', label: 'Or', from: 101, fx: 0 },
  { key: 'platinum', label: 'Platine', from: 151, fx: 1 },
  { key: 'emerald', label: 'Émeraude', from: 201, fx: 1 },
  { key: 'diamond', label: 'Diamant', from: 251, fx: 2 },
  { key: 'master', label: 'Maître', from: 301, fx: 3 },
  { key: 'legend', label: 'Légende', from: 351, fx: 4 },
]

// Five frames per metal, one every ten levels, richer each time
export const LEVEL_FRAME = {
  span: 50,
  step: 10,
  // Effects wake from this step
  fxFrom: 2,
  steps: [
    { wing: 0, crest: 0, studs: false, ring: false, gem: false },
    { wing: 2, crest: 0, studs: true, ring: false, gem: false },
    { wing: 3, crest: 0, studs: true, ring: true, gem: true },
    { wing: 5, crest: 0, studs: true, ring: true, gem: true },
    { wing: 7, crest: 2, studs: true, ring: true, gem: true },
  ] as FrameStep[],
} as const

// Skin copy
export const LEVEL_SKIN_COPY = {
  badge: 'Niv. {level}',
  title: 'Niveau {level}, {skin}',
} as const
