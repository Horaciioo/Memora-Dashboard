import type { DecorScene } from '@/composites/play/naval/world/decor/types'
import { paintCrown, paintFall, paintFlag } from '@/composites/play/naval/world/life/shore'
import type {
  ActorPainter,
  DecorActor,
  DecorActorKind,
} from '@/composites/play/naval/world/life/types'
import {
  paintBubbles,
  paintBuoy,
  paintFish,
  paintGlints,
} from '@/composites/play/naval/world/life/water'

export type { CrownFrond, DecorActor } from '@/composites/play/naval/world/life/types'

/**
 * Painter of each moving thing
 * @type {Object}
 */

const ACTOR_PAINTERS: { [Kind in DecorActorKind]: ActorPainter<Kind> } = {
  fish: paintFish,
  bubbles: paintBubbles,
  glints: paintGlints,
  buoy: paintBuoy,
  flag: paintFlag,
  fall: paintFall,
  crown: paintCrown,
}

/**
 * Height of each kind: under the water first, the crowns last
 * @type {Record<DecorActorKind, number>}
 */

const ACTOR_LAYERS: Record<DecorActorKind, number> = {
  fish: 0,
  bubbles: 0,
  glints: 1,
  buoy: 2,
  fall: 2,
  flag: 3,
  crown: 3,
}

/**
 * One moving thing at a moment
 * @param {CanvasRenderingContext2D} pen - Pen in squares
 * @param {DecorActor} actor - Thing
 * @param {number} seconds - Clock
 * @return {void}
 */

const paintActor = (pen: CanvasRenderingContext2D, actor: DecorActor, seconds: number): void =>
  (ACTOR_PAINTERS[actor.kind] as ActorPainter<DecorActorKind>)(pen, actor, seconds)

/**
 * Moving things in drawing order
 * @param {DecorActor[]} actors - Things
 * @return {DecorActor[]} - Sorted
 */

export const orderActors = (actors: DecorActor[]): DecorActor[] =>
  actors.toSorted((a, b) => ACTOR_LAYERS[a.kind] - ACTOR_LAYERS[b.kind] || a.y - b.y)

/**
 * Moving things of a frame, fewer fish when the sea is calmed
 * @param {CanvasRenderingContext2D} pen - Pen in squares
 * @param {Object} beat - Things, clock and share of life
 * @return {void}
 */

export const paintActors = (
  pen: CanvasRenderingContext2D,
  { actors, seconds, life }: { actors: DecorActor[]; seconds: number; life: number }
): void => {
  for (const actor of actors) {
    if (actor.kind === 'fish') {
      paintActor(pen, { ...actor, count: Math.max(1, Math.round(actor.count * life)) }, seconds)
      continue
    }
    paintActor(pen, actor, seconds)
  }
}

/**
 * Hands a moving thing to the living layer, or paints it still when there is none
 * @param {DecorScene} scene - Scene
 * @param {DecorActor} actor - Thing
 * @return {void}
 */

export const stageActor = (scene: DecorScene, actor: DecorActor): void => {
  if (scene.live) return scene.live(actor)
  scene.pen.save()
  paintActor(scene.pen, actor, 0)
  scene.pen.restore()
}
