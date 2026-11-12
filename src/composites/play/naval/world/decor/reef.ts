import { paintBommie } from '@/composites/play/naval/world/decor/coral/bommie'
import type { DecorPainter } from '@/composites/play/naval/world/decor/types'
import { stageActor } from '@/composites/play/naval/world/life'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { blob, haze } from '@/composites/play/naval/world/pen'

// Mounds per square of reef
const MOUNDS_PER_AREA = 0.55
// Water over the reef mounds
const REEF_VEIL = 0.16

/**
 * Coral reef in the band: pale sand, mounds of coral, light rippling, fish and bubbles
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintReef: DecorPainter = (scene) => {
  const { pen, look, place, piece, seed } = scene
  const { land, water } = look
  const rng = pieceRng(seed)
  const rx = (place.isAcross ? place.room * 1.1 : place.room * 0.45) * piece.scale
  const ry = (place.isAcross ? place.room * 0.45 : place.room * 1.1) * piece.scale
  pen.globalAlpha = 0.5
  haze(pen, blob({ x: place.x, y: place.y, rx, ry, seed, rough: 0.5 }), {
    colour: land.floor,
    blur: Math.min(rx, ry) * 0.5,
  })
  pen.globalAlpha = 1
  const mounds = Array.from(
    { length: Math.max(3, Math.round(rx * ry * MOUNDS_PER_AREA)) },
    (_, index) => {
      const angle = rng() * Math.PI * 2
      const reach = index ? Math.sqrt(rng()) * 0.85 : 0

      return {
        x: place.x + Math.cos(angle) * rx * reach,
        y: place.y + Math.sin(angle) * ry * reach,
        radius: (0.45 + rng() * 0.5) * (1.2 - reach * 0.5),
        veil: REEF_VEIL,
        rng,
        seed: seed + index * 13,
      }
    }
  )
  for (const mound of mounds.toSorted((a, b) => a.y - b.y)) paintBommie(pen, look, mound)
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
