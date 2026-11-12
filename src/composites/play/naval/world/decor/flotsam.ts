import { circle } from '@/composites/play/naval/world/decor/blocks'
import { paintBarrel, paintCrate } from '@/composites/play/naval/world/decor/props'
import type { DecorPainter } from '@/composites/play/naval/world/decor/types'
import { stageActor } from '@/composites/play/naval/world/life'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { haze, trace } from '@/composites/play/naval/world/pen'

// Things adrift in one patch
const ADRIFT = 7

/**
 * Flotsam: barrels, crates and planks adrift, a rope trailing, buoys rolling on the swell
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintFlotsam: DecorPainter = (scene) => {
  const { pen, look, place, piece, seed } = scene
  const { land, water } = look
  const rng = pieceRng(seed)
  const reach = Math.min(place.room * 0.4, 2.2) * piece.scale
  const things = Array.from({ length: ADRIFT }, (_, index) => ({
    x: place.x + (rng() - 0.5) * reach * (place.isAcross ? 3 : 1.6),
    y: place.y + (rng() - 0.5) * reach * (place.isAcross ? 1.6 : 3),
    kind: index % 3,
    turn: rng() * Math.PI,
    size: 0.12 + rng() * 0.05,
  }))
  for (const thing of things.toSorted((a, b) => a.y - b.y)) {
    haze(pen, circle(thing.x, thing.y, thing.size * 1.4), { colour: water.foam, blur: 0.12 })
    if (thing.kind === 0) paintBarrel(scene, { ...thing, isLying: rng() < 0.6 })
    if (thing.kind === 1) paintCrate(scene, thing)
    if (thing.kind !== 2) continue
    pen.save()
    pen.translate(thing.x, thing.y)
    pen.rotate(thing.turn)
    pen.fillStyle = land.plank
    pen.fillRect(-0.4, -0.05, 0.8, 0.1)
    pen.fillStyle = land.woodDark
    pen.fillRect(-0.4, -0.05, 0.8, 0.02)
    pen.restore()
  }
  pen.strokeStyle = land.rope
  pen.lineWidth = 0.03
  pen.beginPath()
  const [start] = things
  pen.moveTo(start.x, start.y)
  for (let bend = 1; bend <= 6; bend += 1) {
    pen.quadraticCurveTo(
      start.x + bend * 0.25,
      start.y + (bend % 2 ? 0.2 : -0.2),
      start.x + bend * 0.3,
      start.y
    )
  }
  pen.stroke()
  trace(pen, circle(start.x, start.y, 0.12))
  pen.stroke()
  for (let buoy = 0; buoy < 2; buoy += 1) {
    stageActor(scene, {
      kind: 'buoy',
      x: place.x + (buoy ? reach : -reach) * 0.6,
      y: place.y + (rng() - 0.5) * reach,
      size: 0.12,
      colour: land.buoy,
      band: land.mark,
      foam: water.foam,
      seed: seed + buoy,
    })
  }
}
