import type { DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { stageActor } from '@/composites/play/naval/world/life'
import { shade } from '@/composites/play/naval/world/pen'

// Fronds of one palm crown
const FRONDS = 8

/**
 * Palm standing on the sand
 * @typedef {Object} PalmStand
 * @property {number} size - Crown radius, squares
 * @property {[number, number]} [lean] - Trunk bend, squares
 * @property {boolean} [hasNuts] - Coconuts at the heart
 */

export interface PalmStand {
  x: number
  y: number
  size: number
  rng: () => number
  lean?: [number, number]
  hasNuts?: boolean
}

/**
 * Palm seen from above: shadow, curved trunk, swaying crown
 * @param {DecorScene} scene - Scene
 * @param {PalmStand} palm - Foot and size
 * @return {void}
 */

export const paintPalm = (scene: DecorScene, palm: PalmStand): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  const { x, y, size, rng } = palm
  const [lx, ly] = liftOf(board, x, y, size * 1.6)
  const [bendX, bendY] = palm.lean ?? [(rng() - 0.5) * size * 0.6, 0]
  const top = { x: x + lx + bendX, y: y + ly + bendY }

  // Crown shadow cast on the sand
  pen.fillStyle = look.light.shade
  pen.beginPath()
  pen.ellipse(
    top.x - lx * 0.6 - sun[0] * size * 0.7,
    top.y - ly * 0.6 - sun[1] * size * 0.5,
    size * 0.85,
    size * 0.5,
    0,
    0,
    Math.PI * 2
  )
  pen.fill()
  pen.strokeStyle = land.trunk
  pen.lineWidth = size * 0.13
  pen.lineCap = 'round'
  pen.beginPath()
  pen.moveTo(x, y)
  pen.quadraticCurveTo(x + bendX * 0.2, y + ly * 0.5 + bendY * 0.2, top.x, top.y)
  pen.stroke()
  const turn = rng() * Math.PI
  stageActor(scene, {
    kind: 'crown',
    x: top.x,
    y: top.y,
    rib: shade(land.leafDark, -0.1),
    heart: shade(land.trunk, -0.25),
    nuts: palm.hasNuts ? land.nut : undefined,
    seed: rng() * 10,
    fronds: Array.from({ length: FRONDS }, (_, index) => {
      const angle = turn + (index / FRONDS) * Math.PI * 2
      // Fronds facing the sun lighter
      const facing = Math.cos(angle) * sun[0] + Math.sin(angle) * sun[1]

      return {
        length: size * (0.85 + rng() * 0.3),
        angle,
        colour: shade(index % 2 ? land.leaf : land.leafLight, facing * 0.18 - 0.05),
      }
    }),
  })
}
