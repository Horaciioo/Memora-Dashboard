import { paintCliff } from '@/composites/play/naval/world/decor/cliff'
import { paintLighthouse, paintWreck } from '@/composites/play/naval/world/decor/coast'
import { paintHarbour } from '@/composites/play/naval/world/decor/harbour'
import { paintFactory, paintRig } from '@/composites/play/naval/world/decor/industry'
import { paintIsland } from '@/composites/play/naval/world/decor/island'
import { paintIslet, paintRocks } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter } from '@/composites/play/naval/world/decor/types'
import { paintVolcano } from '@/composites/play/naval/world/decor/volcano'
import { NavalDecorKinds } from '@/declarations/play/naval/maps'
import type { NavalDecorKind } from '@/declarations/play/naval/maps'

export type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'

/**
 * Painter of each decor kind
 * @type {Record<NavalDecorKind, DecorPainter>}
 */

export const DECOR_PAINTERS: Record<NavalDecorKind, DecorPainter> = {
  [NavalDecorKinds.Island]: paintIsland,
  [NavalDecorKinds.Rocks]: paintRocks,
  [NavalDecorKinds.Cliff]: paintCliff,
  [NavalDecorKinds.Volcano]: paintVolcano,
  [NavalDecorKinds.Islet]: paintIslet,
  [NavalDecorKinds.Harbour]: paintHarbour,
  [NavalDecorKinds.Factory]: paintFactory,
  [NavalDecorKinds.Rig]: paintRig,
  [NavalDecorKinds.Lighthouse]: paintLighthouse,
  [NavalDecorKinds.Wreck]: paintWreck,
}
