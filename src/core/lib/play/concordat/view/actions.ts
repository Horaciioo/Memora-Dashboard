import type { ConcordatTieRow } from '@/core/lib/play/concordat/wire/systems'
import {
  ConcordatIntents,
  ConcordatOfferKinds,
  ConcordatTargetActions,
  ConcordatTies,
} from '@/utils/constants/concordat'
import type { ConcordatTargetAction, ConcordatTieKind } from '@/utils/constants/concordat'

/**
 * Tie between two nations, hostile when none is written
 * @param {ConcordatTieRow[]} ties - Ties
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {ConcordatTieKind} - Tie
 */

export const tieOfRows = (
  ties: ConcordatTieRow[],
  first: number,
  second: number
): ConcordatTieKind => {
  const low = Math.min(first, second)
  const high = Math.max(first, second)

  return ties.find((tie) => tie.a === low && tie.b === high)?.kind ?? ConcordatTies.Hostile
}

// Gestures per tie, the first is the main one
const ACTIONS: Record<ConcordatTieKind, ConcordatTargetAction[]> = {
  [ConcordatTies.Hostile]: [
    ConcordatTargetActions.Attack,
    ConcordatTargetActions.Peace,
    ConcordatTargetActions.Alliance,
    ConcordatTargetActions.Trade,
  ],
  [ConcordatTies.Peace]: [
    ConcordatTargetActions.Alliance,
    ConcordatTargetActions.Trade,
    ConcordatTargetActions.Break,
  ],
  [ConcordatTies.Alliance]: [
    ConcordatTargetActions.Aid,
    ConcordatTargetActions.Trade,
    ConcordatTargetActions.Break,
  ],
}

/**
 * Gestures offered on a nation
 * @param {ConcordatTieKind} tie - Tie with it
 * @return {ConcordatTargetAction[]} - Gestures
 */

export const actionsFor = (tie: ConcordatTieKind): ConcordatTargetAction[] => ACTIONS[tie]

/**
 * Request body of a gesture
 * @param {ConcordatTargetAction} action - Gesture
 * @param {number} target - Nation
 * @param {number} percent - Share of troops
 * @param {number} [tile] - Tile clicked, its zone is the one attacked
 * @return {Record<string, unknown>} - Body
 */

export const bodyFor = (
  action: ConcordatTargetAction,
  target: number,
  percent: number,
  tile?: number
): Record<string, unknown> => {
  if (action === ConcordatTargetActions.Attack) {
    return { type: ConcordatIntents.Engage, target, percent, tile }
  }
  if (action === ConcordatTargetActions.Break) return { type: ConcordatIntents.Break, with: target }
  if (action === ConcordatTargetActions.Aid)
    return { type: ConcordatIntents.Aid, to: target, percent }
  if (action === ConcordatTargetActions.Trade)
    return { type: ConcordatIntents.OpenTrade, to: target }
  const offer =
    action === ConcordatTargetActions.Peace
      ? ConcordatOfferKinds.Peace
      : ConcordatOfferKinds.Alliance

  return { type: ConcordatIntents.Propose, to: target, offer }
}
