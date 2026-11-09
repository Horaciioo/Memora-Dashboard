import { GOLF_VOTE_TIMING } from '@/declarations/play/golf/vote'

const TIMING = GOLF_VOTE_TIMING.deck

/**
 * One pose of a card on the draw timeline, in card widths from the stage centre
 * @typedef {Object} GolfDeckPose
 * @property {number} at - Ms from the start
 * @property {number} x - Across
 * @property {number} y - Down
 * @property {number} tilt - Degrees
 * @property {number} scale - Size
 * @property {number} opacity - Shown
 * @property {boolean} isFaceUp - Face or back
 */

export interface GolfDeckPose {
  at: number
  x: number
  y: number
  tilt: number
  scale: number
  opacity: number
  isFaceUp: boolean
}

/**
 * Whole draw of a tournament
 * @typedef {Object} GolfDeckPlan
 * @property {GolfDeckPose[][]} pile - Poses of each catalogue card
 * @property {GolfDeckPose[][]} dealt - Poses of each dealt card, in play order
 * @property {number} total - Ms of the whole draw
 * @property {{ width: number, height: number }} stage - Size in card widths
 */

export interface GolfDeckPlan {
  pile: GolfDeckPose[][]
  dealt: GolfDeckPose[][]
  total: number
  stage: { width: number; height: number }
}

/**
 * Seeded random source, same seed same draw on every screen
 * @param {string} seed - Game id
 * @return {() => number} - Zero to one
 */

export const seededRandom = (seed: string): (() => number) => {
  let state = [...seed].reduce(
    (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619),
    2166136261
  )

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Grid slot of each card, half the cards rounded up on top
 * @param {number} count - Cards
 * @return {{ x: number, y: number, row: number }[]} - Slots, in card widths from the centre
 */

export const deckGrid = (count: number) => {
  const pitch = 1 + TIMING.gap
  const top = Math.ceil(count / 2)

  return Array.from({ length: count }, (_, index) => {
    const row = index < top ? 0 : 1
    const length = row === 0 ? top : count - top
    const column = row === 0 ? index : index - top

    return { row, x: (column - (length - 1) / 2) * pitch, y: (row - 0.5) * pitch }
  })
}

/**
 * Ms the draw lasts
 * @param {number} cards - Catalogue cards
 * @param {number} dealt - Cards dealt
 * @return {number} - Ms
 */

export const deckDuration = (cards: number, dealt: number): number =>
  TIMING.hold +
  Math.max(cards - 1, 0) * TIMING.stackGap +
  TIMING.stack +
  TIMING.move +
  Math.max(dealt - 1, 0) * TIMING.dealGap +
  TIMING.deal +
  TIMING.vanish +
  TIMING.rest

/**
 * Every pose of the draw: grid, crooked pile, top left corner, deal, fade
 * @param {number} cards - Catalogue cards
 * @param {number} dealt - Courses of the plan
 * @param {string} seed - Game id
 * @return {GolfDeckPlan} - Timeline
 */

export const deckPlan = (cards: number, dealt: number, seed: string): GolfDeckPlan => {
  const random = seededRandom(seed)
  const pitch = 1 + TIMING.gap
  const grid = deckGrid(cards)
  const width = Math.max(Math.ceil(cards / 2), dealt) * pitch
  const height = 2 * pitch
  const corner = { x: -width / 2 + 0.5, y: -pitch / 2 }
  const crooked = grid.map(() => ({
    tilt: (random() * 2 - 1) * TIMING.maxTilt,
    dx: (random() * 2 - 1) * TIMING.maxShift,
    dy: (random() * 2 - 1) * TIMING.maxShift,
  }))
  const stacked = TIMING.hold + Math.max(cards - 1, 0) * TIMING.stackGap + TIMING.stack
  const moved = stacked + TIMING.move
  const lastDeal = moved + Math.max(dealt - 1, 0) * TIMING.dealGap + TIMING.deal
  const gone = lastDeal + TIMING.vanish
  const total = deckDuration(cards, dealt)
  const pose = (at: number, rest: Omit<GolfDeckPose, 'at'>): GolfDeckPose => ({ at, ...rest })

  const pile = grid.map((slot, index) => {
    const { tilt, dx, dy } = crooked[index]
    const leaves = TIMING.hold + index * TIMING.stackGap
    const atPile = { x: dx, y: dy, tilt, scale: 1, opacity: 1, isFaceUp: false }
    const atCorner = { ...atPile, x: corner.x + dx, y: corner.y + dy }
    const flat = { x: slot.x, y: slot.y, tilt: 0, scale: 1, opacity: 1, isFaceUp: true }

    return [
      pose(0, flat),
      pose(leaves, flat),
      pose(leaves + TIMING.stack, atPile),
      pose(stacked, atPile),
      pose(moved, atCorner),
      pose(lastDeal, atCorner),
      pose(gone, { ...atCorner, tilt: 0, scale: 0.6, opacity: 0 }),
      pose(total, { ...atCorner, tilt: 0, scale: 0.6, opacity: 0 }),
    ]
  })

  const top = crooked.at(-1) ?? { tilt: 0, dx: 0, dy: 0 }
  const from = { x: corner.x + top.dx, y: corner.y + top.dy, tilt: top.tilt, scale: 1 }
  const dealtPoses = Array.from({ length: dealt }, (_, index) => {
    const leaves = moved + index * TIMING.dealGap
    const slot = { x: (index - (dealt - 1) / 2) * pitch, y: pitch / 2, tilt: 0, scale: 1 }

    return [
      pose(0, { ...from, opacity: 0, isFaceUp: false }),
      pose(leaves, { ...from, opacity: 0, isFaceUp: false }),
      pose(leaves + 1, { ...from, opacity: 1, isFaceUp: false }),
      pose(leaves + TIMING.deal, { ...slot, opacity: 1, isFaceUp: true }),
      pose(total, { ...slot, opacity: 1, isFaceUp: true }),
    ]
  })

  return { pile, dealt: dealtPoses, total, stage: { width, height } }
}
