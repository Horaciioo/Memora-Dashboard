import { CONCORDAT } from '@/declarations/play/concordat/rules'
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
  [ConcordatTies.Hostile]: [ConcordatTargetActions.Attack, ConcordatTargetActions.Alliance],
  [ConcordatTies.Alliance]: [
    ConcordatTargetActions.Aid,
    ConcordatTargetActions.Trade,
    ConcordatTargetActions.Break,
  ],
}

/**
 * Gestures offered on a nation
 * @param {ConcordatTieKind} tie - Tie with it
 * @param {boolean} [isEmbargoed] - My trade ban stands against it
 * @return {ConcordatTargetAction[]} - Gestures
 */

export const actionsFor = (tie: ConcordatTieKind, isEmbargoed = false): ConcordatTargetAction[] => [
  ...ACTIONS[tie],
  ...(tie === ConcordatTies.Alliance ? [] : [ConcordatTargetActions.Mark]),
  // Gold goes to friends only
  ...(tie === ConcordatTies.Hostile ? [] : [ConcordatTargetActions.Donate]),
  isEmbargoed ? ConcordatTargetActions.Lift : ConcordatTargetActions.Embargo,
]

/**
 * Request body of a gesture
 * @param {ConcordatTargetAction} action - Gesture
 * @param {number} target - Nation
 * @param {number} percent - Share of troops
 * @param {number} [tile] - Tile clicked, used for a landing
 * @param {number} [gold] - Gold held, the share of a donation
 * @return {Record<string, unknown>} - Body
 */

export const bodyFor = (
  action: ConcordatTargetAction,
  target: number,
  percent: number,
  tile?: number,
  gold = 0
): Record<string, unknown> => {
  if (action === ConcordatTargetActions.Attack) {
    return { type: ConcordatIntents.Engage, target, percent, tile }
  }
  if (action === ConcordatTargetActions.Donate) {
    const share = Math.floor((gold * percent) / 100)

    return {
      type: ConcordatIntents.Gift,
      to: target,
      resource: 'gold',
      amount: Math.min(share, Math.floor(gold * CONCORDAT.diplomacy.giftMax)),
    }
  }
  if (action === ConcordatTargetActions.Mark) return { type: ConcordatIntents.Target, with: target }
  if (action === ConcordatTargetActions.Break) return { type: ConcordatIntents.Break, with: target }
  if (action === ConcordatTargetActions.Embargo || action === ConcordatTargetActions.Lift) {
    return {
      type: ConcordatIntents.Embargo,
      with: target,
      on: action === ConcordatTargetActions.Embargo,
    }
  }
  if (action === ConcordatTargetActions.Aid)
    return { type: ConcordatIntents.Aid, to: target, percent }
  if (action === ConcordatTargetActions.Trade)
    return { type: ConcordatIntents.OpenTrade, to: target }

  return { type: ConcordatIntents.Propose, to: target, offer: ConcordatOfferKinds.Alliance }
}
