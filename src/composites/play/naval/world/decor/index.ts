import type { DecorPainter } from '@/composites/play/naval/world/decor/types'
import { NavalDecorKinds } from '@/declarations/play/naval/maps'
import type { NavalDecor, NavalDecorKind } from '@/declarations/play/naval/maps'

export type {
  DecorLight,
  DecorPainter,
  DecorScene,
} from '@/composites/play/naval/world/decor/types'

// Painters a map needs, fetched for it alone
export type DecorPainters = Partial<Record<NavalDecorKind, DecorPainter>>

/**
 * Loader of each decor kind, a map never fetches the others
 * @type {Record<NavalDecorKind, () => Promise<DecorPainter>>}
 */

const DECOR_LOADERS: Record<NavalDecorKind, () => Promise<DecorPainter>> = {
  [NavalDecorKinds.Island]: () =>
    import('@/composites/play/naval/world/decor/island').then((m) => m.paintIsland),
  [NavalDecorKinds.Rocks]: () =>
    import('@/composites/play/naval/world/decor/rocks').then((m) => m.paintRocks),
  [NavalDecorKinds.Cliff]: () =>
    import('@/composites/play/naval/world/decor/cliff').then((m) => m.paintCliff),
  [NavalDecorKinds.Volcano]: () =>
    import('@/composites/play/naval/world/decor/volcano').then((m) => m.paintVolcano),
  [NavalDecorKinds.Islet]: () =>
    import('@/composites/play/naval/world/decor/rocks').then((m) => m.paintIslet),
  [NavalDecorKinds.Harbour]: () =>
    import('@/composites/play/naval/world/decor/harbour').then((m) => m.paintHarbour),
  [NavalDecorKinds.Factory]: () =>
    import('@/composites/play/naval/world/decor/industry').then((m) => m.paintFactory),
  [NavalDecorKinds.Rig]: () =>
    import('@/composites/play/naval/world/decor/industry').then((m) => m.paintRig),
  [NavalDecorKinds.Lighthouse]: () =>
    import('@/composites/play/naval/world/decor/coast').then((m) => m.paintLighthouse),
  [NavalDecorKinds.Wreck]: () =>
    import('@/composites/play/naval/world/decor/coast').then((m) => m.paintWreck),
  [NavalDecorKinds.Village]: () =>
    import('@/composites/play/naval/world/decor/village').then((m) => m.paintVillage),
  [NavalDecorKinds.Quay]: () =>
    import('@/composites/play/naval/world/decor/quay').then((m) => m.paintQuay),
  [NavalDecorKinds.Beacon]: () =>
    import('@/composites/play/naval/world/decor/beacon').then((m) => m.paintBeacon),
  [NavalDecorKinds.Cove]: () =>
    import('@/composites/play/naval/world/decor/cove').then((m) => m.paintCove),
  [NavalDecorKinds.Galleon]: () =>
    import('@/composites/play/naval/world/decor/galleon').then((m) => m.paintGalleon),
  [NavalDecorKinds.Flotsam]: () =>
    import('@/composites/play/naval/world/decor/flotsam').then((m) => m.paintFlotsam),
  [NavalDecorKinds.Reef]: () =>
    import('@/composites/play/naval/world/decor/reef').then((m) => m.paintReef),
  [NavalDecorKinds.Sandbar]: () =>
    import('@/composites/play/naval/world/decor/sandbar').then((m) => m.paintSandbar),
  [NavalDecorKinds.Seabed]: () =>
    import('@/composites/play/naval/world/decor/seabed').then((m) => m.paintSeabed),
}

/**
 * Painters of the pieces of a map
 * @param {NavalDecor[]} decor - Pieces
 * @return {Promise<DecorPainters>} - Painter per kind used
 */

export const loadDecor = async (decor: NavalDecor[]): Promise<DecorPainters> => {
  const kinds = [...new Set(decor.map((piece) => piece.kind))]
  const painters = await Promise.all(kinds.map((kind) => DECOR_LOADERS[kind]()))

  return Object.fromEntries(kinds.map((kind, index) => [kind, painters[index]]))
}
