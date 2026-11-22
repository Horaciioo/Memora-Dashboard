import { expireOffers } from '@/core/lib/play/concordat/diplomacy/offers'
import { adjustTrust } from '@/core/lib/play/concordat/diplomacy/trust'
import { clearTie, setTie, tieBetween } from '@/core/lib/play/concordat/diplomacy/ties'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatTies } from '@/utils/constants/concordat'

const { diplomacy } = CONCORDAT

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
    const isBroken = tie.breakAt > 0 && tie.breakAt <= state.tick
    if (!isHostileOver && !isBroken) continue

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
      (tie) => (tie.a === player.id || tie.b === player.id) && tie.kind === ConcordatTies.Alliance
    )
    if (holds) adjustTrust(state, player.id, gain * (1 + state.effects[player.id - 1].trustGain))
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
}
