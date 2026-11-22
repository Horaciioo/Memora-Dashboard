import {
  aidRefusal,
  alliesOf,
  isCondemned,
  proposeRefusal,
  tieKindOf,
} from '@/core/lib/play/concordat/diplomacy'
import { troopCap } from '@/core/lib/play/concordat/sim/economy'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import type { ConcordatBotContext } from '@/core/lib/play/concordat/bots/view'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatOffer } from '@/types/concordat'
import { ConcordatOfferKinds, ConcordatTies } from '@/utils/constants/concordat'
import type { ConcordatOfferKind } from '@/utils/constants/concordat'

const { bots, diplomacy } = CONCORDAT

/**
 * Weaker than a nation: troops ratio under the configured line
 * @param {ConcordatBotContext} context - Decision
 * @param {number} other - Nation
 * @return {boolean} - Weaker
 */

export const isWeakerThan = (context: ConcordatBotContext, other: number): boolean =>
  context.view.me.troops < context.state.players[other - 1].troops * bots.weakRatio

// Answer to one offer, a bot always answers so the inbox empties
const verdictOf = (context: ConcordatBotContext, offer: ConcordatOffer, roll: number): boolean => {
  const { state, profile, view, isCaretaker } = context
  const sender = state.players[offer.from - 1]

  if (offer.kind === ConcordatOfferKinds.Alliance) {
    if (view.allies >= diplomacy.maxAllies || isCondemned(state, offer.from)) return false

    const isCrushing = view.me.troops > (sender?.troops ?? 0) * 2 && profile.opportunity === 1
    if (isCaretaker || isWeakerThan(context, offer.from)) return true

    const isTrusted = state.trust[offer.from - 1] >= diplomacy.trustStart

    return (
      (isTrusted && roll < Math.max(profile.alliance, context.pressure * bots.lateAlliance)) ||
      (!isCrushing && roll < profile.answers)
    )
  }
  if (offer.kind === ConcordatOfferKinds.Trade) return roll < Math.min(1, profile.trade + 0.3)

  // A request is never granted
  return false
}

/**
 * Answers to every offer waiting in the inbox
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent[]} - Commands
 */

export const answerMoves = (context: ConcordatBotContext): ConcordatIntent[] =>
  context.state.offers
    .filter((offer) => offer.to === context.view.me.id)
    .map((offer, index) => ({
      kind: verdictOf(context, offer, context.roll(40 + index)) ? 'accept' : 'refuse',
      playerId: context.view.me.id,
      offer: offer.id,
    }))

/**
 * Proposals to the neighbours: alliance when weak or to the trusted, trade to partners
 * @param {ConcordatBotContext} context - Decision
 * @param {Map<number, number>} lastProposal - Tick of the last proposal per nation
 * @return {ConcordatIntent[]} - Commands
 */

export const proposeMoves = (
  context: ConcordatBotContext,
  lastProposal: Map<number, number>
): ConcordatIntent[] => {
  const { state, profile, view, isCaretaker, roll } = context
  const playerId = view.me.id
  const wait = ticksOf(60)

  for (const { id } of view.neighbours) {
    if (state.tick - (lastProposal.get(id) ?? -wait) < wait) continue

    const tie = tieKindOf(state, playerId, id)
    const isTrusted = state.trust[id - 1] >= diplomacy.trustStart
    let offer: ConcordatOfferKind | null = null
    if (!tie && (isCaretaker || isWeakerThan(context, id))) offer = ConcordatOfferKinds.Alliance
    else if (
      !tie &&
      isTrusted &&
      roll(60 + id) < Math.max(profile.alliance, context.pressure * bots.lateAlliance)
    )
      offer = ConcordatOfferKinds.Alliance
    else if (tie && tie !== ConcordatTies.Hostile && roll(80 + id) < profile.trade)
      offer = ConcordatOfferKinds.Trade
    if (!offer) continue

    const move: ConcordatIntent = {
      kind: 'propose',
      playerId,
      to: id,
      offer,
      ask: 0,
      about: 0,
    }
    if (proposeRefusal(state, move)) continue

    lastProposal.set(id, state.tick)

    return [move]
  }

  return []
}

/**
 * A loyal bot sends a share of its troops to an ally that runs low
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent[]} - Commands
 */

export const aidMoves = (context: ConcordatBotContext): ConcordatIntent[] => {
  const { state, profile, view, roll } = context
  if (view.me.troops < bots.aidReserve * troopCap(view.me)) return []

  for (const id of alliesOf(state, view.me.id)) {
    const ally = state.players[id - 1]
    if (!ally.alive || ally.troops > view.me.troops * bots.aidNeedRatio) continue
    if (roll(120 + id) > profile.loyalty) continue

    const move: ConcordatIntent = {
      kind: 'aid',
      playerId: view.me.id,
      to: id,
      percent: bots.aidPercent,
    }
    if (!aidRefusal(state, move as Extract<ConcordatIntent, { kind: 'aid' }>)) return [move]
  }

  return []
}
