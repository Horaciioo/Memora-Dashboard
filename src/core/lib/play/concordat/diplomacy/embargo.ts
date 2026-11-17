import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'

const { diplomacy } = CONCORDAT

// Ban still in force
const isLive = (state: ConcordatState, until: number): boolean => until === 0 || until > state.tick

/**
 * A trade ban stands between two nations, whoever laid it
 * @param {ConcordatState} state - Game
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {boolean} - Banned
 */

export const isEmbargoed = (state: ConcordatState, first: number, second: number): boolean =>
  state.embargoes.some(
    (ban) =>
      isLive(state, ban.until) &&
      ((ban.from === first && ban.to === second) || (ban.from === second && ban.to === first))
  )

/**
 * Lay a ban, a longer one replaces a shorter one, zero seconds holds it until lifted
 * @param {ConcordatState} state - Game
 * @param {number} from - Nation refusing to trade
 * @param {number} to - Nation refused
 * @param {number} seconds - Length, zero for no end
 * @return {void}
 */

export const layEmbargo = (
  state: ConcordatState,
  from: number,
  to: number,
  seconds: number
): void => {
  const until = seconds ? state.tick + ticksOf(seconds) : 0
  const held = state.embargoes.find((ban) => ban.from === from && ban.to === to)
  if (!held) state.embargoes.push({ from, to, until })
  else if (held.until !== 0) held.until = until === 0 ? 0 : Math.max(held.until, until)
  state.isSystemsDirty = true
}

/**
 * Lift the ban a nation laid
 * @param {ConcordatState} state - Game
 * @param {number} from - Nation that laid it
 * @param {number} to - Nation refused
 * @return {void}
 */

export const liftEmbargo = (state: ConcordatState, from: number, to: number): void => {
  const kept = state.embargoes.filter((ban) => !(ban.from === from && ban.to === to))
  if (kept.length === state.embargoes.length) return

  state.embargoes = kept
  state.isSystemsDirty = true
}

/**
 * Mark a nation that broke a treaty: weaker for a while, shunned by its former partner
 * @param {ConcordatState} state - Game
 * @param {number} traitor - Nation
 * @param {number} victim - Nation betrayed
 * @return {void}
 */

export const markTraitor = (state: ConcordatState, traitor: number, victim: number): void => {
  state.traitors[traitor - 1] = state.tick + ticksOf(diplomacy.traitorSeconds)
  layEmbargo(state, victim, traitor, diplomacy.embargoBetrayalSeconds)
  state.isSystemsDirty = true
}

/**
 * A traitor mark still weighs on a nation
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {boolean} - Marked
 */

export const isTraitor = (state: ConcordatState, playerId: number): boolean =>
  (state.traitors[playerId - 1] ?? 0) > state.tick

/**
 * Drop the bans that ran out, a few times a second at most
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runEmbargoes = (state: ConcordatState): void => {
  if (state.tick % 10 !== 0 || !state.embargoes.length) return

  const kept = state.embargoes.filter((ban) => isLive(state, ban.until))
  if (kept.length === state.embargoes.length) return

  state.embargoes = kept
  state.isSystemsDirty = true
}

/**
 * Why a nation cannot lay or lift a ban, null when it can
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {number} other - Nation targeted
 * @return {string | null} - Reason
 */

export const embargoRefusal = (
  state: ConcordatState,
  playerId: number,
  other: number
): string | null => {
  if (!CONCORDAT.features.diplomacy) return 'featureOff'
  if (other === playerId || !state.players[other - 1]?.alive) return 'badRequest'

  return null
}
