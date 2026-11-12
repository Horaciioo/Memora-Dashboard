// One leaf of a palm crown
export interface CrownFrond {
  length: number
  angle: number
  colour: string
}

/**
 * Things of the decor that move, painted every frame
 * @typedef {Object} DecorActor
 */

export type DecorActor =
  | {
      kind: 'fish'
      x: number
      y: number
      rx: number
      ry: number
      count: number
      size: number
      colours: string[]
      seed: number
    }
  | { kind: 'bubbles'; x: number; y: number; radius: number; colour: string; seed: number }
  | {
      kind: 'glints'
      x: number
      y: number
      rx: number
      ry: number
      count: number
      colour: string
      seed: number
    }
  | {
      kind: 'buoy'
      x: number
      y: number
      size: number
      colour: string
      band: string
      foam: string
      seed: number
    }
  | {
      kind: 'flag'
      x: number
      y: number
      size: number
      cloth: string
      mark: string
      seed: number
    }
  | {
      kind: 'fall'
      x: number
      y: number
      dx: number
      dy: number
      width: number
      colour: string
      foam: string
      seed: number
    }
  | {
      kind: 'crown'
      x: number
      y: number
      fronds: CrownFrond[]
      rib: string
      heart: string
      nuts?: string
      seed: number
    }

export type DecorActorKind = DecorActor['kind']

// Painter of one moving thing, seconds zero when still
export type ActorPainter<Kind extends DecorActorKind> = (
  pen: CanvasRenderingContext2D,
  actor: Extract<DecorActor, { kind: Kind }>,
  seconds: number
) => void
