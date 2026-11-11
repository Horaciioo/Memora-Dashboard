import { paintBomb, paintPlane } from '@/composites/play/naval/fx/actors/air'
import { paintFlare } from '@/composites/play/naval/fx/actors/flare'
import { paintGunship, paintSubmarine } from '@/composites/play/naval/fx/actors/machines'
import type { ActorPainter } from '@/composites/play/naval/fx/actors/scene'
import {
  paintMissile,
  paintMortar,
  paintMuzzle,
  paintShell,
} from '@/composites/play/naval/fx/actors/shells'
import { NavalActors } from '@/utils/constants/play'
import type { NavalActorName } from '@/utils/constants/play'

export type { ActorScene } from '@/composites/play/naval/fx/actors/scene'

/**
 * Painter of each actor
 * @type {Record<NavalActorName, ActorPainter>}
 */

export const ACTOR_PAINTERS: Record<NavalActorName, ActorPainter> = {
  [NavalActors.Muzzle]: paintMuzzle,
  [NavalActors.Shell]: paintShell,
  [NavalActors.Mortar]: paintMortar,
  [NavalActors.Plane]: paintPlane,
  [NavalActors.Bomb]: paintBomb,
  [NavalActors.Gunship]: paintGunship,
  [NavalActors.Submarine]: paintSubmarine,
  [NavalActors.Missile]: paintMissile,
  [NavalActors.Flare]: paintFlare,
}
