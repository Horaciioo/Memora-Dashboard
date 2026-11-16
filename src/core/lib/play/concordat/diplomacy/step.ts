import { expireOffers, sendOffer } from '@/core/lib/play/concordat/diplomacy/offers'
import { adjustTrust, isCondemned } from '@/core/lib/play/concordat/diplomacy/trust'
import { alliesOf, clearTie, setTie, tieBetween } from '@/core/lib/play/concordat/diplomacy/ties'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatOfferKinds, ConcordatTerrains, ConcordatTies } from '@/utils/constants/concordat'

const { diplomacy } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)
// Border tiles read per fallen nation when looking for neighbours
const FRONT_SAMPLE = 600

// Fighting keeps the hostile tie alive
const markFights = (state: ConcordatState): void => {
  for (const corps of state.corps) {
    if (!corps.target) continue

    const tie = tieBetween(state, corps.owner, corps.target)
    if (tie?.kind === ConcordatTies.Hostile) tie.since = state.tick
    else if (!tie) setTie(state, { a: corps.owner, b: corps.target, kind: ConcordatTies.Hostile })
  }
}

// Ties that ran out
const endTies = (state: ConcordatState): void => {
  for (const tie of [...state.relations]) {
    const isHostileOver =
      tie.kind === ConcordatTies.Hostile &&
      state.tick - tie.since > ticksOf(diplomacy.hostileSeconds)
    const isPeaceOver = tie.kind === ConcordatTies.Peace && tie.until > 0 && tie.until <= state.tick
    const isAllianceOver =
      tie.kind === ConcordatTies.Alliance && tie.until > 0 && tie.until <= state.tick
    const isBroken = tie.breakAt > 0 && tie.breakAt <= state.tick
    if (!isHostileOver && !isPeaceOver && !isAllianceOver && !isBroken) continue

    clearTie(state, tie.a, tie.b)
    if (!isHostileOver)
      emit(state, { tick: state.tick, kind: 'broken', actor: 0, victim: tie.a, tile: tie.b })
  }
}

// Treaties held earn credit
const earnTrust = (state: ConcordatState): void => {
  const gain = diplomacy.trustPerMinute / 60
  for (const player of state.players) {
    if (!player.alive) continue

    const holds = state.relations.some(
      (tie) =>
        (tie.a === player.id || tie.b === player.id) &&
        (tie.kind === ConcordatTies.Peace || tie.kind === ConcordatTies.Alliance)
    )
    if (holds) adjustTrust(state, player.id, gain * (1 + state.effects[player.id - 1].trustGain))
  }
}

// Nations touching the border of a fallen one
const neighboursOf = (state: ConcordatState, playerId: number): Set<number> => {
  const found = new Set<number>()
  const { width, height, terrain } = state.map
  let read = 0

  for (const edge of state.players[playerId - 1].front) {
    if (read++ > FRONT_SAMPLE) break
    const count = neighborsOf(edge, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const holder = state.owner[near[slot]]
      if (holder && holder !== playerId && terrain[near[slot]] !== ConcordatTerrains.Sea) {
        found.add(holder)
      }
    }
  }

  return found
}

// Neighbours of a condemned nation are invited to a coalition
const callCoalitions = (state: ConcordatState): void => {
  state.coalitions = state.coalitions.filter((coalition) => coalition.until > state.tick)
  for (const player of state.players) {
    if (!player.alive || !isCondemned(state, player.id)) continue

    for (const peer of neighboursOf(state, player.id)) {
      const isMember = state.coalitions.some(
        (coalition) => coalition.target === player.id && coalition.members.includes(peer)
      )
      const isCalled = state.offers.some(
        (offer) =>
          offer.kind === ConcordatOfferKinds.Coalition &&
          offer.to === peer &&
          offer.about === player.id
      )
      if (isMember || isCalled || alliesOf(state, player.id).includes(peer)) continue

      sendOffer(state, {
        from: 0,
        to: peer,
        kind: ConcordatOfferKinds.Coalition,
        minutes: 0,
        ask: 0,
        about: player.id,
      })
    }
  }
}

/**
 * Diplomacy phase of a tick
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runDiplomacy = (state: ConcordatState): void => {
  if (!CONCORDAT.features.diplomacy) return

  markFights(state)
  expireOffers(state)
  const everySecond = state.tick % CONCORDAT_TICKS_PER_SECOND === 0
  if (!everySecond) return

  endTies(state)
  earnTrust(state)
  if (state.tick % (CONCORDAT_TICKS_PER_SECOND * 10) === 0) callCoalitions(state)
}
