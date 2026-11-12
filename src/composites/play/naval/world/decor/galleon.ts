import { paintLamp } from '@/composites/play/naval/world/decor/blocks'
import { paintStone, stoneOutline } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, haze, shade, trace } from '@/composites/play/naval/world/pen'
import type { Outline } from '@/composites/play/naval/world/pen'

// Points along each side of the hull
const SIDE_STEPS = 16
// Share of the hull still above the water, from the stern
const AFLOAT = 0.55

/**
 * Old ship lying in the bay
 * @typedef {Object} Hull
 */

interface Hull {
  x: number
  y: number
  length: number
  beam: number
  angle: number
}

/**
 * Point of the hull: along from the stern (minus one) to the bow (one), across the beam
 * @param {Hull} hull - Hull
 * @param {number} along - Minus one to one
 * @param {number} across - Minus one to one
 * @return {[number, number]} - Point
 */

const pointOf = (
  { x, y, length, beam, angle }: Hull,
  along: number,
  across: number
): [number, number] => {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
  const px = (along * length) / 2
  const py = (across * beam) / 2

  return [x + px * cos - py * sin, y + px * sin + py * cos]
}

/**
 * Hull outline between two places along it: a square stern, a long pointed bow
 * @param {Hull} hull - Hull
 * @param {number} from - Start along
 * @param {number} to - End along
 * @param {number} [share] - Beam share
 * @return {Outline} - Points
 */

const hullBetween = (hull: Hull, from: number, to: number, share = 1): Outline => {
  const width = (along: number) =>
    share *
    (along > 0.2
      ? Math.sqrt(Math.max(0, 1 - ((along - 0.2) / 0.8) ** 2))
      : 0.88 + (along + 1) * 0.1)
  const side = Array.from(
    { length: SIDE_STEPS + 1 },
    (_, step) => from + ((to - from) * step) / SIDE_STEPS
  )

  return [
    ...side.map((along) => pointOf(hull, along, width(along))),
    ...side.toReversed().map((along) => pointOf(hull, along, -width(along))),
  ]
}

/**
 * Deck planks running along the hull
 * @param {DecorScene} scene - Scene
 * @param {Hull} hull - Hull
 * @param {[number, number]} lift - Deck lift
 * @return {void}
 */

const paintPlanks = ({ pen, look }: DecorScene, hull: Hull, lift: [number, number]): void => {
  pen.strokeStyle = shade(look.land.plank, -0.3)
  pen.lineWidth = 0.02
  pen.beginPath()
  for (let row = -0.7; row <= 0.7; row += 0.175) {
    const [ax, ay] = pointOf(hull, -0.92, row)
    const [bx, by] = pointOf(hull, AFLOAT - 1 + 0.9, row)
    pen.moveTo(ax + lift[0], ay + lift[1])
    pen.lineTo(bx + lift[0], by + lift[1])
  }
  pen.stroke()
}

/**
 * Torn sail sliding off the deck into the water
 * @param {DecorScene} scene - Scene
 * @param {Hull} hull - Hull
 * @param {() => number} rng - Random source
 * @return {void}
 */

const paintSail = ({ pen, look }: DecorScene, hull: Hull, rng: () => number): void => {
  const corners = [
    pointOf(hull, -0.1, -0.2),
    pointOf(hull, 0.25, -0.5),
    pointOf(hull, 0.3, -1.6),
    pointOf(hull, -0.15, -1.5),
  ]
  const cloth: Outline = []
  corners.forEach((corner, index) => {
    const next = corners[(index + 1) % corners.length]
    for (let step = 0; step < 4; step += 1) {
      const share = step / 4
      const tear = index === 2 ? (rng() - 0.3) * 0.18 : 0
      cloth.push([
        corner[0] + (next[0] - corner[0]) * share + tear,
        corner[1] + (next[1] - corner[1]) * share + tear,
      ])
    }
  })
  pen.globalAlpha = 0.92
  pen.fillStyle = look.land.sail
  trace(pen, cloth)
  pen.fill()
  pen.globalAlpha = 1
  pen.strokeStyle = look.land.canvasDark
  pen.lineWidth = 0.03
  pen.stroke()
}

/**
 * Galleon wreck: the bow sunk in the shallows, the stern afloat, a broken mast, a torn sail, a lantern
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintGalleon: DecorPainter = (scene) => {
  const { pen, board, look, place, piece, seed } = scene
  const { land, water, sun } = look
  const rng = pieceRng(seed)
  const hull: Hull = {
    x: place.x,
    y: place.y,
    length: 5.4 * piece.scale,
    beam: 1.5 * piece.scale,
    angle: -0.38,
  }
  const whole = hullBetween(hull, -1, 1)
  haze(pen, whole, { colour: water.lagoon, blur: 1.2 })
  pen.fillStyle = shade(water.deep, -0.3)
  pen.globalAlpha = 0.55
  trace(pen, hullBetween(hull, AFLOAT - 1, 1, 0.92))
  pen.fill()
  pen.globalAlpha = 1
  const afloat = hullBetween(hull, -1, AFLOAT - 1 + 0.9)
  haze(pen, afloat, { colour: water.foam, blur: 0.25 })
  haze(pen, afloat, { colour: look.light.shade, blur: 0.4, dx: -sun[0] * 0.5, dy: -sun[1] * 0.5 })
  const deck = liftOf(board, place.x, place.y, 0.45)
  extrude(pen, { outline: afloat, lift: deck, side: land.woodDark, top: land.plank })
  paintPlanks(scene, hull, deck)
  const castle = hullBetween(hull, -1, -0.62, 0.9).map(([x, y]): [number, number] => [
    x + deck[0],
    y + deck[1],
  ])
  extrude(pen, {
    outline: castle,
    lift: liftOf(board, place.x, place.y, 0.35),
    side: land.woodDark,
    top: land.wood,
  })
  pen.fillStyle = land.iron
  for (const along of [-0.5, -0.25, 0]) {
    for (const across of [-1.08, 1.08]) {
      const [cx, cy] = pointOf(hull, along, across)
      pen.beginPath()
      pen.arc(cx + deck[0], cy + deck[1], 0.06, 0, Math.PI * 2)
      pen.fill()
    }
  }
  const [mx, my] = pointOf(hull, -0.2, 0)
  const mast = liftOf(board, mx, my, 1.1)
  pen.strokeStyle = land.woodDark
  pen.lineWidth = 0.14
  pen.lineCap = 'round'
  pen.beginPath()
  pen.moveTo(mx + deck[0], my + deck[1])
  pen.lineTo(mx + deck[0] + mast[0], my + deck[1] + mast[1])
  pen.stroke()
  // Fallen top of the mast across the rail
  const [fx, fy] = pointOf(hull, 0.2, -2.2)
  pen.strokeStyle = land.wood
  pen.lineWidth = 0.1
  pen.beginPath()
  pen.moveTo(mx + deck[0] + mast[0] * 0.3, my + deck[1] + mast[1] * 0.3)
  pen.lineTo(fx, fy)
  pen.stroke()
  paintSail(scene, hull, rng)
  const [lx, ly] = pointOf(hull, -0.98, 0)
  const lamp = { x: lx + deck[0] * 2, y: ly + deck[1] * 2 }
  paintLamp(pen, { ...lamp, radius: 0.5, colour: land.lamp })
  scene.light?.({ ...lamp, radius: 0.8, colour: land.lamp, beat: 'flicker' })
  for (let index = 0; index < 3; index += 1) {
    const [rx, ry] = pointOf(hull, 0.6 + index * 0.25, (rng() - 0.5) * 2.6)
    paintStone(scene, {
      outline: stoneOutline(rx, ry, 0.22 + rng() * 0.12, rng),
      x: rx,
      y: ry,
      height: 0.25,
    })
  }
}
