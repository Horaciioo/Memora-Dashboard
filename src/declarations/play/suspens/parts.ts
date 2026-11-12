/**
 * Part of the figure and its gallows
 * @typedef {Object} SuspensPart
 * @property {string} key - Name of the part
 * @property {string} d - Path on the drawing grid
 * @property {'wood' | 'rope' | 'body'} tone - Colour family
 */

export interface SuspensPart {
  key: string
  d: string
  tone: 'wood' | 'rope' | 'body'
}

// Drawing grid of the gallows
export const SUSPENS_GRID = { width: 200, height: 240 } as const

/**
 * Parts in the order they appear, the gallows first then the figure, as in the paper game
 * @type {readonly SuspensPart[]}
 */

export const SUSPENS_PARTS: readonly SuspensPart[] = [
  { key: 'base', d: 'M16 222H124', tone: 'wood' },
  { key: 'post', d: 'M44 222V20', tone: 'wood' },
  { key: 'beam', d: 'M44 20H150M44 52L76 20', tone: 'wood' },
  { key: 'rope', d: 'M150 20V48', tone: 'rope' },
  { key: 'head', d: 'M130 68a20 20 0 1 0 40 0a20 20 0 1 0-40 0', tone: 'body' },
  { key: 'body', d: 'M150 88V150', tone: 'body' },
  { key: 'armLeft', d: 'M150 106L124 134', tone: 'body' },
  { key: 'armRight', d: 'M150 106L176 134', tone: 'body' },
  { key: 'legLeft', d: 'M150 150L126 192', tone: 'body' },
  { key: 'legRight', d: 'M150 150L174 192', tone: 'body' },
] as const

// Eyes of the figure once hanged
export const SUSPENS_EYES = 'M139 62l8 8M147 62l-8 8M153 62l8 8M161 62l-8 8'
