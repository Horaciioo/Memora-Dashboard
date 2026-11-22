import { layEmbargo, markTraitor } from '@/core/lib/play/concordat/diplomacy/embargo'
import { adjustTrust, isCondemned } from '@/core/lib/play/concordat/diplomacy/trust'
import { setTie, tieBetween } from '@/core/lib/play/concordat/diplomacy/ties'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatPowers, ConcordatTies } from '@/utils/constants/concordat'

const { diplomacy } = CONCORDAT

/**
 * Why a break is refused, null when it holds
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Breaker
 * @param {number} other - Partner
 * @return {string | null} - Reason
 */

export const breakRefusal = (
  state: ConcordatState,
  playerId: number,
  other: number
): string | null => {
  const tie = tieBetween(state, playerId, other)
  if (!tie || tie.kind === ConcordatTies.Hostile) return 'noTreaty'

  return tie.breakAt ? 'alreadyBreaking' : null
}

/**
 * Break an alliance, it ends after a notice
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Breaker
 * @param {number} other - Partner
 * @return {void}
 */

export const breakTie = (state: ConcordatState, playerId: number, other: number): void => {
  const tie = tieBetween(state, playerId, other)
  if (!tie) return

  // A fallen partner is left without a penalty
  const isFree = isCondemned(state, other)
  tie.breakAt = state.tick + ticksOf(diplomacy.breakNoticeSeconds)
  state.isSystemsDirty = true
  if (!isFree) adjustTrust(state, playerId, -diplomacy.allianceBreak)
  emit(state, { tick: state.tick, kind: 'broken', actor: playerId, victim: other, tile: -1 })
}

/**
 * Why a gift is refused, null when it goes
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'gift' }>} intent - Gift
 * @return {string | null} - Reason
 */

export const giftRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'gift' }>
): string | null => {
  const me = state.players[intent.playerId - 1]
  const peer = state.players[intent.to - 1]
  if (!CONCORDAT.features.diplomacy) return 'featureOff'
  if (!peer || !peer.alive || peer === me) return 'badTarget'
  if (tieBetween(state, me.id, peer.id)?.kind === ConcordatTies.Hostile) return 'hostile'
  if (!Number.isInteger(intent.amount) || intent.amount < diplomacy.giftMinimum) return 'tooSmall'

  const held = intent.resource === 'gold' ? me.gold : me.troops

  return intent.amount > held * diplomacy.giftMax ? 'tooMuch' : null
}

/**
 * Hand over gold or troops
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'gift' }>} intent - Gift
 * @return {void}
 */

export const sendGift = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'gift' }>
): void => {
  const me = state.players[intent.playerId - 1]
  const peer = state.players[intent.to - 1]
  me[intent.resource] -= intent.amount
  peer[intent.resource] += intent.amount
}

/**
 * Credit effects of an attack on a nation, called when troops are sent
 * @param {ConcordatState} state - Game
 * @param {number} attacker - Attacking nation
 * @param {number} target - Attacked nation, zero for free land
 * @return {void}
 */

export const noteAttack = (state: ConcordatState, attacker: number, target: number): void => {
  if (!target || !CONCORDAT.features.diplomacy) return

  // Striking a nation lifts the start shield of the one who strikes
  const striker = state.players[attacker - 1]
  if (state.tick < striker.protectedUntil) {
    striker.protectedUntil = 0
    state.isSystemsDirty = true
  }

  const tie = tieBetween(state, attacker, target)
  const isSpared = isCondemned(state, target)

  if (tie?.kind === ConcordatTies.Alliance && !isSpared) {
    // An ally struck from behind
    adjustTrust(state, attacker, -diplomacy.betrayal)
    state.players[attacker - 1].stability = Math.max(
      0,
      state.players[attacker - 1].stability - diplomacy.betrayalStability
    )
    markTraitor(state, attacker, target)
    emit(state, { tick: state.tick, kind: 'betrayal', actor: attacker, victim: target, tile: -1 })
  } else if (!tie && !isSpared) {
    adjustTrust(state, attacker, -diplomacy.surprise)
  }
  // The attacked refuse the attacker's trade for a short while
  if (state.players[target - 1].kind !== ConcordatPowers.Tribe)
    layEmbargo(state, target, attacker, diplomacy.embargoAttackSeconds)
  setTie(state, { a: attacker, b: target, kind: ConcordatTies.Hostile })
}

/**
 * Cost factor an attacker gets against a defender from joint pushes
 * @param {ConcordatState} state - Game
 * @param {number} attacker - Attacking nation
 * @param {number} defender - Defending nation
 * @return {number} - Factor on the defender cost, one for none
 */

export const attackFactor = (state: ConcordatState, attacker: number, defender: number): number => {
  if (!defender) return 1

  // Allies pushing the same nation at once
  const joint = new Set(
    state.corps
      .filter(
        (corps) =>
          corps.target === defender &&
          corps.owner !== attacker &&
          tieBetween(state, corps.owner, attacker)?.kind === ConcordatTies.Alliance
      )
      .map((corps) => corps.owner)
  )

  return 1 - diplomacy.jointBonus * Math.min(2, joint.size)
}
