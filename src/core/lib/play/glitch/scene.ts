import {
  GLITCH_COLORS,
  GLITCH_KINDS,
  GLITCH_LOOKALIKES,
  GLITCH_SETTINGS,
  GLITCH_THEMES,
} from '@/declarations/play'
import type { GlitchKindName, GlitchTheme } from '@/declarations/play'

/**
 * Element of a picture, a shape or a label
 * @typedef {Object} GlitchItem
 * @property {number} id - Place in the picture
 * @property {string} shape - Shape key, empty for a label
 * @property {string} label - Figure or capital, empty for a shape
 * @property {number} x - Centre, in picture units
 * @property {number} y - Centre, in picture units
 * @property {number} size - Radius
 * @property {number} angle - Turn in degrees
 * @property {number} color - Palette index
 */

export interface GlitchItem {
  id: number
  shape: string
  label: string
  x: number
  y: number
  size: number
  angle: number
  color: number
}

/**
 * Spot where the two pictures differ
 * @typedef {Object} GlitchMark
 */

export interface GlitchMark {
  x: number
  y: number
  r: number
  kind: GlitchKindName
}

/**
 * Both pictures of a round and where they differ
 * @typedef {Object} GlitchScene
 */

export interface GlitchScene {
  theme: string
  left: GlitchItem[]
  right: GlitchItem[]
  marks: GlitchMark[]
}

// Turn added by an angle difference, in degrees
const TURN = 35
// Growth and shrink of a size difference
const GROW = 1.3
const SHRINK = 0.68
// Distance an item slides in a shift difference
const SLIDE = 4.4
// Slack kept inside a cell, in picture units
const PAD = 0.8
// Slide directions tried, in degrees
const SLIDES = [0, 45, 90, 135, 180, 225, 270, 315]
// Resting angles of a plain item
const ANGLES = [-24, -12, 0, 0, 12, 24]

type Random = () => number

interface Cell {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Stream of numbers in [0, 1) fixed by a seed
 * @param {number} seed - Seed
 * @return {Random} - Source
 */

const randomOf = (seed: number): Random => {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T>(items: readonly T[], random: Random): T =>
  items[Math.floor(random() * items.length)]

const shuffle = <T>(items: readonly T[], random: Random): T[] => {
  const mixed = [...items]
  for (let index = mixed.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[mixed[index], mixed[other]] = [mixed[other], mixed[index]]
  }

  return mixed
}

/**
 * Theme of a round, one after the other
 * @param {number} round - Round, from one
 * @return {GlitchTheme} - Theme
 */

export const themeOf = (round: number) => GLITCH_THEMES[(round - 1) % GLITCH_THEMES.length]

/**
 * Cells of the picture grid
 * @return {Cell[]} - Cells
 */

const gridCells = (): Cell[] => {
  const { width, height, cols, rows } = GLITCH_SETTINGS.scene
  const w = width / cols
  const h = height / rows

  return Array.from({ length: cols * rows }, (_, index) => ({
    x: ((index % cols) + 0.5) * w,
    y: (Math.floor(index / cols) + 0.5) * h,
    w,
    h,
  }))
}

/**
 * Item dropped in a cell, a little off centre
 * @param {Object} input - Item
 * @param {number} input.id - Place in the picture
 * @param {Cell} input.cell - Cell
 * @param {GlitchTheme} input.theme - Theme
 * @param {Random} input.random - Source
 * @return {GlitchItem} - Item
 */

const itemIn = ({
  id,
  cell,
  theme,
  random,
}: {
  id: number
  cell: Cell
  theme: GlitchTheme
  random: Random
}): GlitchItem => {
  const { min, max } = GLITCH_SETTINGS.scene.size
  const size = min + random() * (max - min)
  const driftX = Math.max(0, cell.w / 2 - size - PAD)
  const driftY = Math.max(0, cell.h / 2 - size - PAD)
  const isLabel = theme.labels.length > 0 && (theme.shapes.length === 0 || random() < 0.5)

  return {
    id,
    shape: isLabel ? '' : pick(theme.shapes, random),
    label: isLabel ? pick(theme.labels, random) : '',
    x: cell.x + (random() * 2 - 1) * driftX,
    y: cell.y + (random() * 2 - 1) * driftY,
    size,
    angle: pick(ANGLES, random),
    color: Math.floor(random() * GLITCH_COLORS),
  }
}

/**
 * Label that stands for another, the nastier the more it looks like it
 * @param {string} label - Label
 * @param {readonly string[]} pool - Labels of the theme
 * @param {Random} random - Source
 * @return {string} - Other label
 */

const otherLabel = (label: string, pool: readonly string[], random: Random): string => {
  const twin = GLITCH_LOOKALIKES.find((pair) => pair.includes(label))
  if (twin) return twin[0] === label ? twin[1] : twin[0]

  return pick(
    pool.filter((entry) => entry !== label),
    random
  )
}

/**
 * Item seen from the second picture, changed the way a difference says
 * @param {GlitchItem} item - Item of the first picture
 * @param {GlitchKindName} kind - Difference
 * @param {GlitchItem[]} around - Items of the first picture
 * @param {GlitchTheme} theme - Theme
 * @param {Random} random - Source
 * @return {GlitchItem} - Item of the second picture
 */

const changed = (
  item: GlitchItem,
  kind: GlitchKindName,
  around: GlitchItem[],
  theme: GlitchTheme,
  random: Random
): GlitchItem => {
  if (kind === 'color') {
    return {
      ...item,
      color: (item.color + 1 + Math.floor(random() * (GLITCH_COLORS - 1))) % GLITCH_COLORS,
    }
  }
  if (kind === 'shape') {
    return {
      ...item,
      shape: pick(
        theme.shapes.filter((entry) => entry !== item.shape),
        random
      ),
    }
  }
  if (kind === 'label') return { ...item, label: otherLabel(item.label, theme.labels, random) }
  if (kind === 'size') return { ...item, size: item.size * (random() < 0.5 ? GROW : SHRINK) }
  if (kind === 'angle') return { ...item, angle: item.angle + (random() < 0.5 ? TURN : -TURN) }

  // Slide towards the roomiest side
  const room = (degrees: number): number => {
    const x = item.x + Math.cos((degrees * Math.PI) / 180) * SLIDE
    const y = item.y + Math.sin((degrees * Math.PI) / 180) * SLIDE
    const { width, height } = GLITCH_SETTINGS.scene
    const edge = Math.min(x, y, width - x, height - y)
    const near = Math.min(
      ...around
        .filter((other) => other.id !== item.id)
        .map((other) => Math.hypot(other.x - x, other.y - y))
    )

    return Math.min(near, edge * 3)
  }
  const degrees = SLIDES.toSorted((left, right) => room(right) - room(left))[0]

  return {
    ...item,
    x: item.x + Math.cos((degrees * Math.PI) / 180) * SLIDE,
    y: item.y + Math.sin((degrees * Math.PI) / 180) * SLIDE,
  }
}

// Differences that fit an item
const fits = (item: GlitchItem, kind: GlitchKindName, theme: GlitchTheme) => {
  if (kind === 'label') return item.label !== ''
  if (kind === 'shape') return item.shape !== '' && theme.shapes.length > 1
  if (kind === 'angle') return item.shape !== 'circle'

  return true
}

/**
 * Both pictures of a round, drawn from a seed
 * @param {number} seed - Seed of the round
 * @param {number} differences - Differences wanted
 * @param {number} round - Round, from one
 * @param {number} rounds - Rounds in the game
 * @return {GlitchScene} - Pictures and differences
 */

export const buildScene = (
  seed: number,
  differences: number,
  round: number,
  rounds: number
): GlitchScene => {
  const random = randomOf(seed)
  const theme = themeOf(round)
  const { items } = GLITCH_SETTINGS.scene
  const { spread } = GLITCH_SETTINGS
  const progress = rounds > 1 ? (round - 1) / (rounds - 1) : 0
  const count = Math.round(items.min + progress * (items.max - items.min))
  const cells = shuffle(gridCells(), random)
  const base = cells.slice(0, count).map((cell, id) => itemIn({ id, cell, theme, random }))
  const free = cells.slice(count)

  const right = new Map<number, GlitchItem | null>(base.map((item) => [item.id, item]))
  const extras: GlitchItem[] = []
  const marks: GlitchMark[] = []
  const used = new Set<number>()
  const isApart = (x: number, y: number): boolean =>
    marks.every((mark) => Math.hypot(mark.x - x, mark.y - y) >= spread)
  let kinds: GlitchKindName[] = []

  for (let index = 0; index < differences; index += 1) {
    if (!kinds.length) kinds = shuffle(GLITCH_KINDS, random)
    const kind = kinds.shift()!

    if (kind === 'extra') {
      const cell = free.find((entry) => isApart(entry.x, entry.y))
      if (cell) {
        const item = itemIn({ id: count + extras.length, cell, theme, random })
        extras.push(item)
        marks.push({ x: item.x, y: item.y, r: Math.max(item.size * 1.3, 6), kind })
        free.splice(free.indexOf(cell), 1)
        continue
      }
    }

    // No room for an extra, one goes missing instead
    const wanted: GlitchKindName = kind === 'extra' ? 'missing' : kind
    const open = base.filter((item) => !used.has(item.id))
    const apart = open.filter((item) => isApart(item.x, item.y))
    const fitting = apart.filter((item) => fits(item, wanted, theme))
    const target = pick(fitting.length ? fitting : apart.length ? apart : open, random)
    const final: GlitchKindName = fitting.length ? wanted : 'color'
    used.add(target.id)

    if (final === 'missing') {
      right.set(target.id, null)
      marks.push({ x: target.x, y: target.y, r: Math.max(target.size * 1.3, 6), kind: final })
      continue
    }

    const after = changed(target, final, base, theme, random)
    right.set(target.id, after)
    marks.push({
      x: (target.x + after.x) / 2,
      y: (target.y + after.y) / 2,
      r:
        Math.max(Math.max(target.size, after.size) * 1.3, 6) +
        Math.hypot(after.x - target.x, after.y - target.y) / 2,
      kind: final,
    })
  }

  return {
    theme: theme.key,
    left: base,
    right: [...[...right.values()].filter((item): item is GlitchItem => item !== null), ...extras],
    marks,
  }
}

/**
 * Difference under a click, found or not
 * @param {GlitchMark[]} marks - Differences of the round
 * @param {number} x - Click, in picture units
 * @param {number} y - Click, in picture units
 * @return {number} - Index of the nearest difference in reach, -1 for none
 */

export const markAt = (marks: GlitchMark[], x: number, y: number): number => {
  const { tolerance } = GLITCH_SETTINGS
  let best = -1
  let bestGap = Infinity

  marks.forEach((mark, index) => {
    const gap = Math.hypot(mark.x - x, mark.y - y) - mark.r
    if (gap <= tolerance && gap < bestGap) {
      best = index
      bestGap = gap
    }
  })

  return best
}

/**
 * Pictures of a stored round
 * @param {number} seed - Seed of the round
 * @param {number} round - Round, from one
 * @param {{ differences: number; rounds: number }} settings - Game settings
 * @return {GlitchScene} - Pictures and differences
 */

export const roundScene = (
  seed: number,
  round: number,
  settings: { differences: number; rounds: number }
): GlitchScene => buildScene(seed, settings.differences, round, settings.rounds)
