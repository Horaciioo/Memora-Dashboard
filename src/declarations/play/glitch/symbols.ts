/**
 * Geometric shapes drawn in the pictures
 * @type {readonly string[]}
 */

export const GLITCH_SHAPES = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'star',
  'hexagon',
  'cross',
  'heart',
  'pentagon',
  'arrow',
] as const

export type GlitchShapeName = (typeof GLITCH_SHAPES)[number]

// Figures and capitals used as labels
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const NUMBERS = ['12', '21', '24', '42', '36', '63', '57', '75', '88', '38', '90', '19']
const LETTERS = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'X', 'Z']

/**
 * What a picture is made of
 * @typedef {Object} GlitchTheme
 */

export interface GlitchTheme {
  key: string
  shapes: readonly string[]
  labels: readonly string[]
}

/**
 * Themes, one per round in turn
 * @type {readonly GlitchTheme[]}
 */

export const GLITCH_THEMES: readonly GlitchTheme[] = [
  { key: 'numbers', shapes: [], labels: [...DIGITS, ...NUMBERS] },
  { key: 'shapes', shapes: GLITCH_SHAPES, labels: [] },
  { key: 'letters', shapes: [], labels: LETTERS },
  { key: 'mix', shapes: GLITCH_SHAPES, labels: [...DIGITS, ...LETTERS] },
]

/**
 * Labels that look alike, a change from one to the other is the nastiest
 * @type {readonly (readonly string[])[]}
 */

export const GLITCH_LOOKALIKES: readonly (readonly string[])[] = [
  ['6', '9'],
  ['3', '8'],
  ['1', '7'],
  ['2', '5'],
  ['0', '8'],
  ['12', '21'],
  ['24', '42'],
  ['36', '63'],
  ['57', '75'],
  ['88', '38'],
  ['B', 'D'],
  ['P', 'R'],
  ['M', 'N'],
  ['E', 'F'],
  ['Q', 'G'],
  ['K', 'X'],
]

/**
 * Ways the second picture departs from the first
 * @type {readonly string[]}
 */

export const GLITCH_KINDS = [
  'color',
  'shape',
  'label',
  'size',
  'angle',
  'shift',
  'missing',
  'extra',
] as const

export type GlitchKindName = (typeof GLITCH_KINDS)[number]

// Colours of the palette, set by --glitch-c0 to --glitch-c6
export const GLITCH_COLORS = 7
