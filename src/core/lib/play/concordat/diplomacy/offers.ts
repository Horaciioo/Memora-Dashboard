import { disband } from '@/core/lib/play/concordat/sim/attack'
import { alliesOf, clearTie, setTie, tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { openTradeRoutes } from '@/core/lib/play/concordat/trade/open'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatOffer, ConcordatState } from '@/types/concordat'
import {
  CONCORDAT_OFFER_ORDER,
  ConcordatOfferKinds,
  ConcordatTies,
} from '@/utils/constants/concordat'

const { diplomacy } = CONCORDAT

/**
 * Put an offer in the inbox of a nation
 * @param {ConcordatState} state - Game
 * @param {Omit<ConcordatOffer, 'id' | 'expiresAt'>} offer - Offer
 * @return {void}
 */

export const sendOffer = (
  state: ConcordatState,
  offer: Omit<ConcordatOffer, 'id' | 'expiresAt'>
): void => {
  state.offers.push({
    ...offer,
    id: state.nextId++,
    expiresAt: state.tick + ticksOf(diplomacy.offerSeconds),
  })
  state.isOffersDirty = true
}

/**
 * Turn a proposal intent into an offer
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'propose' }>} intent - Proposal
 * @return {void}
 */

export const propose = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'propose' }>
): void =>
  sendOffer(state, {
    from: intent.playerId,
    to: intent.to,
    kind: intent.offer,
    ask: intent.ask,
    about: intent.about,
  })

// Troops between two nations that now hold a treaty go home
const callBackCorps = (state: ConcordatState, first: number, second: number): void => {
  for (const corps of [...state.corps]) {
    const isPair =
      (corps.owner === first && corps.target === second) ||
      (corps.owner === second && corps.target === first)
    if (isPair) disband(state, corps, 0)
  }
}

// Treaty sealed by an accepted offer
const seal = (state: ConcordatState, offer: ConcordatOffer): boolean => {
  const kind = CONCORDAT_OFFER_ORDER.indexOf(offer.kind)
  if (offer.kind === ConcordatOfferKinds.Alliance) {
    const isFull =
      alliesOf(state, offer.from).length >= diplomacy.maxAllies ||
      alliesOf(state, offer.to).length >= diplomacy.maxAllies
    if (isFull) return false

    setTie(state, { a: offer.from, b: offer.to, kind: ConcordatTies.Alliance })
  } else if (offer.kind === ConcordatOfferKinds.Trade) {
    if (tieKindOf(state, offer.from, offer.to) === ConcordatTies.Hostile)
      clearTie(state, offer.from, offer.to)
    if (!openTradeRoutes(state, offer.from, offer.to)) return false
  }
  if (offer.kind === ConcordatOfferKinds.Alliance) {
    callBackCorps(state, offer.from, offer.to)
  }
  emit(state, { tick: state.tick, kind: 'treaty', actor: offer.from, victim: offer.to, tile: kind })

  return true
}

/**
 * Answer an offer
 * @param {ConcordatState} state - Game
 * @param {number} offerId - Offer
 * @param {boolean} isYes - Accepted
 * @return {void}
 */

export const answerOffer = (state: ConcordatState, offerId: number, isYes: boolean): void => {
  const offer = state.offers.find((other) => other.id === offerId)
  if (!offer) return

  state.offers = state.offers.filter((other) => other !== offer)
  state.isOffersDirty = true
  if (!isYes) return

  seal(state, offer)
}

/**
 * Drop offers that waited too long or lost a party
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const expireOffers = (state: ConcordatState): void => {
  const kept = state.offers.filter((offer) => {
    const sender = offer.from ? state.players[offer.from - 1] : null

    return (
      offer.expiresAt > state.tick && state.players[offer.to - 1].alive && (!sender || sender.alive)
    )
  })
  if (kept.length === state.offers.length) return

  state.offers = kept
  state.isOffersDirty = true
}
