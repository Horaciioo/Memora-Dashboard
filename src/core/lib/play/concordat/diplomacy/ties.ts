import { areTeamMates } from '@/core/lib/play/concordat/modes/rules'
import type { ConcordatRelation, ConcordatState } from '@/types/concordat'
import { ConcordatTies } from '@/utils/constants/concordat'
import type { ConcordatTieKind } from '@/utils/constants/concordat'

/**
 * Tie between two nations
 * @param {ConcordatState} state - Game
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {ConcordatRelation | undefined} - Tie, none when neutral
 */

export const tieBetween = (
  state: ConcordatState,
  first: number,
  second: number
): ConcordatRelation | undefined => {
  const low = Math.min(first, second)
  const high = Math.max(first, second)

  return state.relations.find((tie) => tie.a === low && tie.b === high)
}

/**
 * Kind of the tie between two nations
 * @param {ConcordatState} state - Game
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {ConcordatTieKind | null} - Kind, null when neutral
 */

export const tieKindOf = (
  state: ConcordatState,
  first: number,
  second: number
): ConcordatTieKind | null =>
  areTeamMates(state, first, second)
    ? ConcordatTies.Alliance
    : (tieBetween(state, first, second)?.kind ?? null)

/**
 * Peace or alliance holds between two nations
 * @param {ConcordatState} state - Game
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {boolean} - Treaty
 */

export const hasTreaty = (state: ConcordatState, first: number, second: number): boolean => {
  const kind = tieKindOf(state, first, second)

  return kind === ConcordatTies.Peace || kind === ConcordatTies.Alliance
}

/**
 * Set the tie of two nations, replacing the old one
 * @param {ConcordatState} state - Game
 * @param {Object} tie - New tie
 * @param {number} tie.a - Nation
 * @param {number} tie.b - Nation
 * @param {ConcordatTieKind} tie.kind - Kind
 * @param {number} [tie.until] - End of a peace
 * @return {void}
 */

export const setTie = (
  state: ConcordatState,
  tie: { a: number; b: number; kind: ConcordatTieKind; until?: number }
): void => {
  clearTie(state, tie.a, tie.b)
  state.relations.push({
    a: Math.min(tie.a, tie.b),
    b: Math.max(tie.a, tie.b),
    kind: tie.kind,
    since: state.tick,
    until: tie.until ?? 0,
    breakAt: 0,
  })
  state.isSystemsDirty = true
}

/**
 * Drop the tie of two nations
 * @param {ConcordatState} state - Game
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {void}
 */

export const clearTie = (state: ConcordatState, first: number, second: number): void => {
  const tie = tieBetween(state, first, second)
  if (!tie) return

  state.relations = state.relations.filter((other) => other !== tie)
  state.isSystemsDirty = true
}

/**
 * Allies of a nation
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {number[]} - Allies
 */

export const alliesOf = (state: ConcordatState, playerId: number): number[] =>
  state.relations
    .filter(
      (tie) => tie.kind === ConcordatTies.Alliance && (tie.a === playerId || tie.b === playerId)
    )
    .map((tie) => (tie.a === playerId ? tie.b : tie.a))
