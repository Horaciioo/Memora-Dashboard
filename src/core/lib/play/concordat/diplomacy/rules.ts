import { alliesOf, hasTreaty, tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { tradeRefusal } from '@/core/lib/play/concordat/trade/open'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatOfferKinds, ConcordatTies } from '@/utils/constants/concordat'

const { diplomacy } = CONCORDAT

type Propose = Extract<ConcordatIntent, { kind: 'propose' }>

// Nation in play other than the sender
const livePeer = (state: ConcordatState, from: number, to: number): boolean => {
  const peer = state.players[to - 1]

  return Boolean(peer && peer.alive && to !== from)
}

// A pending offer between the same two nations of the same kind
const hasTwin = (state: ConcordatState, intent: Propose): boolean =>
  state.offers.some(
    (offer) =>
      offer.kind === intent.offer &&
      ((offer.from === intent.playerId && offer.to === intent.to) ||
        (offer.from === intent.to && offer.to === intent.playerId))
  )

// What the kind of an offer needs from the current tie
const kindRefusal = (state: ConcordatState, intent: Propose): string | null => {
  const tie = tieKindOf(state, intent.playerId, intent.to)

  if (intent.offer === ConcordatOfferKinds.Peace) {
    if (!(diplomacy.peaceMinutes as readonly number[]).includes(intent.minutes)) return 'badLength'

    return hasTreaty(state, intent.playerId, intent.to) ? 'alreadyTied' : null
  }
  if (intent.offer === ConcordatOfferKinds.Alliance) {
    if (tie === ConcordatTies.Alliance) return 'alreadyTied'

    return alliesOf(state, intent.playerId).length >= diplomacy.maxAllies ||
      alliesOf(state, intent.to).length >= diplomacy.maxAllies
      ? 'tooManyAllies'
      : null
  }
  if (intent.offer === ConcordatOfferKinds.Trade) {
    if (tie === ConcordatTies.Hostile) return 'hostile'

    return tradeRefusal(state, intent.playerId, intent.to)
  }
  if (intent.offer === ConcordatOfferKinds.Request) {
    return intent.ask >= 0 &&
      intent.ask <= 3 &&
      livePeer(state, intent.playerId, intent.about || intent.to)
      ? null
      : 'badRequest'
  }

  return 'badOffer'
}

/**
 * Why a proposal is refused, null when it goes out
 * @param {ConcordatState} state - Game
 * @param {Propose} intent - Proposal
 * @return {string | null} - Reason
 */

export const proposeRefusal = (state: ConcordatState, intent: Propose): string | null => {
  if (!CONCORDAT.features.diplomacy) return 'featureOff'
  if (!livePeer(state, intent.playerId, intent.to)) return 'badTarget'
  if (hasTwin(state, intent)) return 'duplicate'
  if (
    state.offers.filter((offer) => offer.from === intent.playerId).length >= diplomacy.maxOffersOut
  )
    return 'tooManyOffers'

  return kindRefusal(state, intent)
}

/**
 * Why the sender cannot answer an offer, null when they can
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Answering nation
 * @param {number} offerId - Offer
 * @return {string | null} - Reason
 */

export const answerRefusal = (
  state: ConcordatState,
  playerId: number,
  offerId: number
): string | null => {
  const offer = state.offers.find((other) => other.id === offerId)
  if (!offer || offer.to !== playerId) return 'noOffer'

  return null
}
