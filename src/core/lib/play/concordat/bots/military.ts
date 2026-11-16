import { isCondemned } from '@/core/lib/play/concordat/diplomacy'
import { troopCap } from '@/core/lib/play/concordat/sim/economy'
import { intentRefusal } from '@/core/lib/play/concordat/sim/intents'
import { isOpenTarget } from '@/core/lib/play/concordat/bots/view'
import { isPushing, zoneTileOf } from '@/core/lib/play/concordat/bots/zone'
import type { ConcordatBotContext } from '@/core/lib/play/concordat/bots/view'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatBotLevels } from '@/utils/constants/concordat'

const { bots } = CONCORDAT

/**
 * A rival that others are already breaking
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Observer
 * @param {number} target - Rival
 * @return {boolean} - Weak spot
 */

export const isOpportunity = (state: ConcordatState, playerId: number, target: number): boolean => {
  const rival = state.players[target - 1]

  return (
    rival.capital < 0 ||
    rival.stability < bots.stableBelow ||
    isCondemned(state, target) ||
    state.corps.some((corps) => corps.owner !== playerId && corps.target === target && !corps.feint)
  )
}

// Nations pushing into this one
const attackersOf = (state: ConcordatState, playerId: number): Set<number> =>
  new Set(
    state.corps.filter((corps) => corps.target === playerId && !corps.feint).map((c) => c.owner)
  )

// Rival with the best odds, null when none is worth the risk
const pickRival = (context: ConcordatBotContext): { id: number; ratio: number } | null => {
  const { state, profile, view } = context
  const attackers = attackersOf(state, view.me.id)
  let best: { id: number; ratio: number } | null = null

  for (const { id } of view.neighbours) {
    if (!isOpenTarget(state, view.me.id, id)) continue

    const rival = state.players[id - 1]
    const ratio = view.me.troops / Math.max(1, rival.troops)
    const edge = profile.opportunity && isOpportunity(state, view.me.id, id) ? 0.6 : 1
    const revenge = attackers.has(id) ? 0.7 : 1
    const need = (profile.needRatio / Math.max(0.3, profile.aggression)) * edge * revenge
    if (ratio >= need && (!best || ratio > best.ratio)) best = { id, ratio }
  }

  return best
}

// Share of the troops a push may use, the reserve stays home
const sendable = (context: ConcordatBotContext, wanted: number): number => {
  const reserve = context.isCaretaker ? bots.caretaker.reserve : context.profile.reserve

  return Math.max(1, Math.min(Math.floor(wanted), Math.floor((1 - reserve) * 100)))
}

/**
 * Pushes of one decision: free land first, then the best rival
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent[]} - Commands
 */

export const militaryMoves = (context: ConcordatBotContext): ConcordatIntent[] => {
  const { state, profile, view, isCaretaker } = context
  const moves: ConcordatIntent[] = []
  const playerId = view.me.id

  // Troops pile up to the trigger before any push
  if (view.me.troops < troopCap(view.me) * profile.trigger) return moves

  // A push on a zone runs to its end before the next one opens
  const freeTile =
    view.freeContact && !isPushing(state, playerId, 0) ? zoneTileOf(state, playerId, 0) : -1
  if (freeTile >= 0) {
    const wanted = isCaretaker ? bots.caretaker.freePercent : profile.freePercent
    const free: ConcordatIntent = {
      kind: 'engage',
      playerId,
      target: 0,
      percent: sendable(context, wanted),
      tile: freeTile,
    }
    if (!intentRefusal(state, free)) moves.push(free)
  }
  if (isCaretaker) return moves

  // A recruit keeps to free land while any is left
  if (profile.level === ConcordatBotLevels.Recruit && view.freeContact) return moves

  const rival = pickRival(context)
  const rivalTile =
    rival && !isPushing(state, playerId, rival.id) ? zoneTileOf(state, playerId, rival.id) : -1
  if (rival && rivalTile >= 0) {
    const percent = sendable(context, profile.attackPercent * Math.min(1.5, profile.aggression))
    const move: ConcordatIntent = {
      kind: 'engage',
      playerId,
      target: rival.id,
      percent,
      tile: rivalTile,
    }
    if (!intentRefusal(state, move)) moves.push(move)
  }

  return moves
}

/**
 * A treaty partner worth betraying: loyal bots never do, others need an opening
 * @param {ConcordatBotContext} context - Decision
 * @return {ConcordatIntent | null} - Break order
 */

export const betrayalMove = (context: ConcordatBotContext): ConcordatIntent | null => {
  const { state, profile, view, isCaretaker, roll } = context
  if (isCaretaker || !profile.betrays || roll(5) >= profile.betray) return null

  for (const { id } of view.neighbours) {
    if (isOpenTarget(state, view.me.id, id)) continue

    const rival = state.players[id - 1]
    const isStrong = view.me.troops > rival.troops * profile.needRatio * 1.5
    if (isStrong && isOpportunity(state, view.me.id, id)) {
      return { kind: 'break', playerId: view.me.id, with: id }
    }
  }

  return null
}
