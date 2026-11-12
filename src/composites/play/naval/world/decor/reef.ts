import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { stageActor } from '@/composites/play/naval/world/life'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { blob, haze, shade, trace } from '@/composites/play/naval/world/pen'

// Coral heads per square of reef
const HEADS_PER_AREA = 7

// Shape of one coral head
type CoralKind = 'brain' | 'branch' | 'fan' | 'anemone'

/**
 * One coral head on the floor
 * @typedef {Object} CoralHead
 */

interface CoralHead {
  x: number
  y: number
  size: number
  colour: string
  kind: CoralKind
  turn: number
}

/**
 * Brain coral: a round dome, its winding grooves
 * @param {DecorScene} scene - Scene
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintBrain = ({ pen }: DecorScene, { x, y, size, colour, turn }: CoralHead): void => {
  pen.fillStyle = colour
  pen.beginPath()
  pen.arc(x, y, size, 0, Math.PI * 2)
  pen.fill()
  pen.strokeStyle = shade(colour, -0.25)
  pen.lineWidth = size * 0.1
  pen.beginPath()
  for (let groove = 0; groove < 3; groove += 1) {
    const radius = size * (0.3 + groove * 0.22)
    pen.moveTo(x + Math.cos(turn) * radius, y + Math.sin(turn) * radius)
    for (let step = 1; step <= 10; step += 1) {
      const angle = turn + step * 0.55
      const wave = radius * (1 + Math.sin(step * 2.1) * 0.12)
      pen.lineTo(x + Math.cos(angle) * wave, y + Math.sin(angle) * wave)
    }
  }
  pen.stroke()
}

/**
 * Branching coral: forked arms spreading from a foot
 * @param {DecorScene} scene - Scene
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintBranch = ({ pen }: DecorScene, { x, y, size, colour, turn }: CoralHead): void => {
  pen.strokeStyle = colour
  pen.lineCap = 'round'
  pen.lineWidth = size * 0.16
  pen.beginPath()
  for (let arm = 0; arm < 6; arm += 1) {
    const angle = turn + (arm / 6) * Math.PI * 2
    const [ex, ey] = [x + Math.cos(angle) * size, y + Math.sin(angle) * size]
    pen.moveTo(x, y)
    pen.lineTo(ex, ey)
    for (const fork of [-0.6, 0.6]) {
      pen.moveTo(x + Math.cos(angle) * size * 0.55, y + Math.sin(angle) * size * 0.55)
      pen.lineTo(
        ex + Math.cos(angle + fork) * size * 0.35,
        ey + Math.sin(angle + fork) * size * 0.35
      )
    }
  }
  pen.stroke()
  pen.fillStyle = shade(colour, 0.35)
  for (let arm = 0; arm < 6; arm += 1) {
    const angle = turn + (arm / 6) * Math.PI * 2
    pen.beginPath()
    pen.arc(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size * 0.1, 0, Math.PI * 2)
    pen.fill()
  }
}

/**
 * Sea fan: a lacy half disc and its veins
 * @param {DecorScene} scene - Scene
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintFan = ({ pen }: DecorScene, { x, y, size, colour, turn }: CoralHead): void => {
  pen.globalAlpha = 0.75
  pen.fillStyle = colour
  pen.beginPath()
  pen.moveTo(x, y)
  pen.arc(x, y, size * 1.2, turn, turn + Math.PI)
  pen.closePath()
  pen.fill()
  pen.globalAlpha = 1
  pen.strokeStyle = shade(colour, -0.3)
  pen.lineWidth = size * 0.06
  pen.beginPath()
  for (let vein = 0; vein <= 6; vein += 1) {
    const angle = turn + (vein / 6) * Math.PI
    pen.moveTo(x, y)
    pen.lineTo(x + Math.cos(angle) * size * 1.15, y + Math.sin(angle) * size * 1.15)
  }
  pen.stroke()
}

/**
 * Anemone: a soft heart ringed with tentacles
 * @param {DecorScene} scene - Scene
 * @param {CoralHead} head - Head
 * @return {void}
 */

const paintAnemone = ({ pen }: DecorScene, { x, y, size, colour, turn }: CoralHead): void => {
  pen.strokeStyle = shade(colour, 0.2)
  pen.lineCap = 'round'
  pen.lineWidth = size * 0.14
  pen.beginPath()
  for (let arm = 0; arm < 14; arm += 1) {
    const angle = turn + (arm / 14) * Math.PI * 2
    const reach = size * (0.9 + (arm % 2) * 0.2)
    pen.moveTo(x + Math.cos(angle) * size * 0.4, y + Math.sin(angle) * size * 0.4)
    pen.lineTo(x + Math.cos(angle + 0.2) * reach, y + Math.sin(angle + 0.2) * reach)
  }
  pen.stroke()
  pen.fillStyle = shade(colour, -0.2)
  pen.beginPath()
  pen.arc(x, y, size * 0.4, 0, Math.PI * 2)
  pen.fill()
}

/**
 * Painter of each coral shape
 * @type {Record<CoralKind, (scene: DecorScene, head: CoralHead) => void>}
 */

const CORALS: Record<CoralKind, (scene: DecorScene, head: CoralHead) => void> = {
  brain: paintBrain,
  branch: paintBranch,
  fan: paintFan,
  anemone: paintAnemone,
}

/**
 * Coral reef under clear water: pale sand floor, coloured heads, a veil of water, fish and bubbles
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintReef: DecorPainter = (scene) => {
  const { pen, look, place, piece, seed } = scene
  const { land, water } = look
  const rng = pieceRng(seed)
  const rx = (place.isAcross ? place.room * 1.1 : place.room * 0.42) * piece.scale
  const ry = (place.isAcross ? place.room * 0.42 : place.room * 1.1) * piece.scale
  const floor = blob({ x: place.x, y: place.y, rx, ry, seed, rough: 0.5 })
  haze(pen, floor, { colour: land.floor, blur: Math.min(rx, ry) * 0.6 })
  const colours = [
    land.coralPink,
    land.coralViolet,
    land.coralOrange,
    land.coralYellow,
    land.coralPink,
  ]
  const kinds: CoralKind[] = ['brain', 'branch', 'fan', 'branch', 'anemone']
  const heads: CoralHead[] = Array.from(
    { length: Math.round(rx * ry * HEADS_PER_AREA) },
    (_, index) => {
      const angle = rng() * Math.PI * 2
      const reach = Math.sqrt(rng()) * 0.95

      return {
        x: place.x + Math.cos(angle) * rx * reach,
        y: place.y + Math.sin(angle) * ry * reach,
        size: 0.12 + rng() * 0.16 * (1 - reach * 0.5),
        colour: shade(colours[index % colours.length], (rng() - 0.5) * 0.2),
        kind: kinds[Math.floor(rng() * kinds.length)],
        turn: rng() * Math.PI * 2,
      }
    }
  )
  pen.save()
  pen.globalAlpha = 0.9
  for (const head of heads.toSorted((a, b) => a.size - b.size)) CORALS[head.kind](scene, head)
  pen.restore()
  // Water over the reef, deeper at its rim
  pen.save()
  pen.globalAlpha = 0.22
  pen.fillStyle = water.shallow
  trace(pen, floor)
  pen.fill()
  pen.restore()
  stageActor(scene, {
    kind: 'fish',
    x: place.x,
    y: place.y,
    rx: rx * 0.8,
    ry: ry * 0.8,
    count: 9,
    size: 0.09,
    colours: [land.fishYellow, land.fishBlue, land.fishYellow],
    seed: seed % 97,
  })
  stageActor(scene, {
    kind: 'fish',
    x: place.x + rx * 0.2,
    y: place.y - ry * 0.1,
    rx: rx * 0.45,
    ry: ry * 0.45,
    count: 6,
    size: 0.07,
    colours: [land.fishOrange, land.mark ?? water.foam],
    seed: (seed % 89) + 3,
  })
  stageActor(scene, {
    kind: 'bubbles',
    x: place.x - rx * 0.3,
    y: place.y,
    radius: 0.4,
    colour: water.foam,
    seed: seed % 7,
  })
}
