import { paintBoat } from '@/composites/play/naval/world/decor/boat'
import { rect } from '@/composites/play/naval/world/decor/blocks'
import { paintAmphora, paintCrate } from '@/composites/play/naval/world/decor/props'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { stageActor } from '@/composites/play/naval/world/life'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, haze, shade, sunlit, trace } from '@/composites/play/naval/world/pen'
import type { Lift, Outline } from '@/composites/play/naval/world/pen'

// Squares of stone between the water and the promenade
const COPING = 0.28
// Squares between two pontoons
const PONTOON_EVERY = 4.2
const PONTOON_WIDTH = 0.5

/**
 * Quay line: the water edge, the pontoon roots, the promenade depth
 * @param {DecorScene} scene - Scene
 * @return {Object} - Edge row, ends, pontoons
 */

const layoutOf = ({ board, place }: DecorScene) => {
  const edge = place.y
  const left = -4
  const right = board.left + board.size + 1.2
  const first = board.left + 2.4
  const count = Math.max(2, Math.floor((right - first - 1) / PONTOON_EVERY) + 1)
  const pontoons = Array.from({ length: count }, (_, index) => first + index * PONTOON_EVERY)
  const ground: Outline = [
    [left, edge],
    [right, edge],
    [right + 0.8, edge + 0.6],
    [right + 1.4, edge + 1.8],
    [board.width + 4, edge + 2.4],
    [board.width + 4, board.height + 30],
    [left, board.height + 30],
  ]

  return { edge, left, right, pontoons, ground }
}

/**
 * Stone coping along the water: large blocks, their joints, a lit rim
 * @param {DecorScene} scene - Scene
 * @param {Object} quay - Edge, ends and lift
 * @return {void}
 */

const paintCoping = (
  { pen, look }: DecorScene,
  { edge, left, right, lift }: { edge: number; left: number; right: number; lift: Lift }
): void => {
  const { land } = look
  const y = edge + lift[1]
  pen.fillStyle = land.stoneDark
  pen.fillRect(left + lift[0], y, right - left, COPING)
  pen.fillStyle = land.stoneLight
  pen.fillRect(left + lift[0], y, right - left, COPING * 0.25)
  pen.strokeStyle = shade(land.stoneDark, -0.25)
  pen.lineWidth = 0.025
  pen.beginPath()
  for (let x = left; x < right; x += 0.62) {
    pen.moveTo(x + lift[0], y)
    pen.lineTo(x + lift[0], y + COPING)
  }
  pen.stroke()
}

/**
 * Paving of the promenade, large slabs barely drawn
 * @param {DecorScene} scene - Scene
 * @param {Object} quay - Edge, ends and lift
 * @return {void}
 */

const paintPaving = (
  { pen, look }: DecorScene,
  { edge, left, right, lift }: { edge: number; left: number; right: number; lift: Lift }
): void => {
  pen.strokeStyle = look.land.stoneDark
  pen.globalAlpha = 0.22
  pen.lineWidth = 0.02
  pen.beginPath()
  for (let row = 1; row < 4; row += 1) {
    const y = edge + COPING + row * 0.32 + lift[1]
    pen.moveTo(left + lift[0], y)
    pen.lineTo(right + lift[0], y)
    for (let x = left + (row % 2) * 0.35; x < right; x += 0.7) {
      pen.moveTo(x + lift[0], y - 0.32)
      pen.lineTo(x + lift[0], y)
    }
  }
  pen.stroke()
  pen.globalAlpha = 1
}

/**
 * Wooden pontoon on posts, reaching from the quay towards the harbour mouth
 * @param {DecorScene} scene - Scene
 * @param {Object} pontoon - Root column, quay edge, length
 * @return {void}
 */

const paintPontoon = (
  { pen, board, look }: DecorScene,
  { x, edge, length }: { x: number; edge: number; length: number }
): void => {
  const { land, sun } = look
  const deck = rect(x - PONTOON_WIDTH / 2, edge - length, PONTOON_WIDTH, length)
  const lift = liftOf(board, x, edge, 0.22)
  pen.fillStyle = look.light.shade
  trace(pen, deck, -sun[0] * 0.3, -sun[1] * 0.3)
  pen.fill()
  for (let post = 0.2; post < length; post += 0.8) {
    for (const side of [-1, 1]) {
      pen.fillStyle = land.woodDark
      pen.beginPath()
      pen.arc(x + side * PONTOON_WIDTH * 0.5, edge - post, 0.06, 0, Math.PI * 2)
      pen.fill()
    }
  }
  extrude(pen, { outline: deck, lift, side: land.woodDark, top: land.plank })
  pen.strokeStyle = shade(land.plank, -0.28)
  pen.lineWidth = 0.018
  pen.beginPath()
  for (let plank = 0.12; plank < length; plank += 0.14) {
    pen.moveTo(x - PONTOON_WIDTH / 2 + lift[0], edge - plank + lift[1])
    pen.lineTo(x + PONTOON_WIDTH / 2 + lift[0], edge - plank + lift[1])
  }
  pen.stroke()
}

/**
 * Fishing net drying on the stones, its cork floats along one edge
 * @param {DecorScene} scene - Scene
 * @param {Object} net - Corner, size and lift
 * @return {void}
 */

const paintNet = (
  { pen, look }: DecorScene,
  {
    x,
    y,
    width,
    depth,
    rng,
  }: { x: number; y: number; width: number; depth: number; rng: () => number }
): void => {
  const { land } = look
  const sag = () => (rng() - 0.5) * 0.18
  const outline: Outline = [
    [x + sag(), y + sag()],
    [x + width * 0.5, y + sag() - 0.08],
    [x + width + sag(), y + sag()],
    [x + width + sag(), y + depth + sag()],
    [x + width * 0.5, y + depth + 0.12],
    [x + sag(), y + depth + sag()],
  ]
  pen.save()
  pen.fillStyle = land.net
  pen.globalAlpha = 0.35
  trace(pen, outline)
  pen.fill()
  trace(pen, outline)
  pen.clip()
  pen.globalAlpha = 0.85
  pen.strokeStyle = land.net
  pen.lineWidth = 0.018
  pen.beginPath()
  for (let line = -depth; line < width + depth; line += 0.11) {
    pen.moveTo(x + line, y - 0.2)
    pen.lineTo(x + line + depth + 0.4, y + depth + 0.2)
    pen.moveTo(x + line + depth + 0.4, y - 0.2)
    pen.lineTo(x + line, y + depth + 0.2)
  }
  pen.stroke()
  pen.restore()
  pen.fillStyle = land.float
  for (let float = 0; float <= 6; float += 1) {
    const share = float / 6
    pen.beginPath()
    pen.arc(x + width * share, y + (share - 0.5) ** 2 * -0.2, 0.05, 0, Math.PI * 2)
    pen.fill()
  }
}

/**
 * Jars and amphorae gathered by a pontoon, some lying
 * @param {DecorScene} scene - Scene
 * @param {Object} pile - Centre, lift and source
 * @return {void}
 */

const paintJars = (
  scene: DecorScene,
  { x, y, base, rng }: { x: number; y: number; base: Lift; rng: () => number }
): void => {
  const jars = Array.from({ length: 5 + Math.floor(rng() * 4) }, (_, index) => ({
    x: x + (index % 3) * 0.3 + (rng() - 0.5) * 0.12,
    y: y + Math.floor(index / 3) * 0.28 + (rng() - 0.5) * 0.1,
    size: 0.1 + rng() * 0.05,
    isLying: rng() < 0.2,
  }))
  for (const jar of jars.toSorted((a, b) => a.y - b.y)) paintAmphora(scene, { ...jar, base })
}

/**
 * Boats along the pontoons and stern to the quay, bright paints in turn
 * @param {DecorScene} scene - Scene
 * @param {Object} harbour - Pontoons, edge, length
 * @return {void}
 */

const paintFleet = (
  scene: DecorScene,
  {
    pontoons,
    edge,
    length,
    rng,
  }: { pontoons: number[]; edge: number; length: number; rng: () => number }
): void => {
  const { land } = scene.look
  const paints = [
    [land.boatBlue, land.boatWhite],
    [land.boatYellow, land.boatBlue],
    [land.boatWhite, land.boatRed],
    [land.boatGreen, land.boatYellow],
    [land.boatRed, land.boatWhite],
  ]
  let turn = 0
  const next = () => paints[turn++ % paints.length]
  for (const pontoon of pontoons) {
    for (const side of [-1, 1]) {
      if (rng() < 0.2) continue
      const [hull, trim] = next()
      const along = 0.9 + rng() * (length - 1.8)
      paintBoat(scene, {
        x: pontoon + side * 0.62,
        y: edge - along,
        length: 1.1 + rng() * 0.4,
        angle: Math.PI / 2 + (rng() - 0.5) * 0.12,
        hull,
        trim,
        hasCabin: rng() < 0.3,
        hasOars: rng() < 0.4,
      })
    }
  }
}

/**
 * Old stone quay: coping, promenade, wooden pontoons, painted boats, nets, jars and buoys
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintQuay: DecorPainter = (scene) => {
  const { pen, board, look, place, seed } = scene
  const { land, water, sun } = look
  const rng = pieceRng(seed)
  const { edge, left, right, pontoons, ground } = layoutOf(scene)
  const lift = liftOf(board, place.x, edge, 0.35)
  const length = Math.max(1.6, edge - board.top - board.size - 0.4)
  haze(pen, ground, { colour: water.lagoon, blur: 1.6 })
  haze(pen, ground, { colour: water.foam, blur: 0.18 })
  extrude(pen, {
    outline: ground,
    lift,
    side: land.stoneDark,
    top: sunlit(pen, {
      x: place.x,
      y: edge + 2,
      radius: 6,
      sun,
      colour: land.paving,
      strength: 0.06,
    }),
  })
  paintCoping(scene, { edge, left, right, lift })
  paintPaving(scene, { edge, left, right, lift })
  for (const x of pontoons) paintPontoon(scene, { x, edge, length })
  paintFleet(scene, { pontoons, edge, length, rng })
  const promenade = edge + COPING + lift[1]
  pontoons.forEach((x, index) => {
    if (index % 2)
      paintNet(scene, { x: x + 0.7 + lift[0], y: promenade + 0.3, width: 1.6, depth: 0.7, rng })
    else paintJars(scene, { x: x + 0.6, y: promenade + 0.25, base: [lift[0], 0], rng })
    paintCrate(scene, {
      x: x - 0.9,
      y: promenade + 0.5 + rng() * 0.3,
      base: [lift[0], 0],
      size: 0.14,
      turn: rng(),
    })
  })
  pen.fillStyle = land.iron
  for (let x = left + 1; x < right; x += 1.3) {
    pen.beginPath()
    pen.arc(x + lift[0], promenade + 0.06, 0.06, 0, Math.PI * 2)
    pen.fill()
  }
  const mouth = board.top + board.size + 0.5
  for (let buoy = 0; buoy < 4; buoy += 1) {
    stageActor(scene, {
      kind: 'buoy',
      x: board.left + 1.5 + buoy * (board.size / 3.6) + rng(),
      y: mouth + rng() * Math.max(0.4, length - 1.2),
      size: 0.11,
      colour: buoy % 2 ? land.boatRed : land.float,
      band: land.boatWhite,
      foam: water.foam,
      seed: buoy * 1.9,
    })
  }
}
