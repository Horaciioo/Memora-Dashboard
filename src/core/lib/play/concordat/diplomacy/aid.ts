import { tieBetween } from '@/core/lib/play/concordat/diplomacy/ties'
import { adjustTrust } from '@/core/lib/play/concordat/diplomacy/trust'
import { troopCap } from '@/core/lib/play/concordat/sim/economy'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatRelation, ConcordatState } from '@/types/concordat'
import { ConcordatTies } from '@/utils/constants/concordat'

const { pact } = CONCORDAT.trade

type Aid = Extract<ConcordatIntent, { kind: 'aid' }>

// Tick of the last aid a nation sent through a tie
const sentAt = (tie: ConcordatRelation, from: number): number =>
  (from === tie.a ? tie.aidA : tie.aidB) ?? -Infinity

// Troops the receiver can still hold
const roomOf = (state: ConcordatState, to: number): number => {
  const peer = state.players[to - 1]

  return troopCap(peer, state.effects[to - 1].cap) - peer.troops
}

// Troops leaving the sender, capped by the room left at the receiver
const amountOf = (state: ConcordatState, intent: Aid): number => {
  const asked = (state.players[intent.playerId - 1].troops * intent.percent) / 100
  const room = roomOf(state, intent.to) / (1 - pact.aidLoss)

  return Math.min(asked, room)
}

/**
 * Why reinforcements are refused, null when they go
 * @param {ConcordatState} state - Game
 * @param {Aid} intent - Aid
 * @return {string | null} - Reason
 */

export const aidRefusal = (state: ConcordatState, intent: Aid): string | null => {
  const tie = tieBetween(state, intent.playerId, intent.to)
  const peer = state.players[intent.to - 1]
  if (!CONCORDAT.features.diplomacy) return 'featureOff'
  if (!peer?.alive || intent.to === intent.playerId) return 'badTarget'
  if (tie?.kind !== ConcordatTies.Alliance) return 'notAllied'
  if (!Number.isFinite(intent.percent) || intent.percent < 1 || intent.percent > 100)
    return 'tooSmall'
  if (state.tick - sentAt(tie, intent.playerId) < ticksOf(pact.aidCooldownSeconds))
    return 'aidCooldown'
  if (roomOf(state, intent.to) < pact.aidMin) return 'aidFull'

  return amountOf(state, intent) < pact.aidMin ? 'aidSmall' : null
}

/**
 * Send troops to an ally, part is lost on the way
 * @param {ConcordatState} state - Game
 * @param {Aid} intent - Aid
 * @return {void}
 */

export const sendAid = (state: ConcordatState, intent: Aid): void => {
  const tie = tieBetween(state, intent.playerId, intent.to)
  if (!tie) return

  const amount = amountOf(state, intent)
  state.players[intent.playerId - 1].troops -= amount
  state.players[intent.to - 1].troops += amount * (1 - pact.aidLoss)
  if (intent.playerId === tie.a) tie.aidA = state.tick
  else tie.aidB = state.tick
  adjustTrust(state, intent.to, pact.aidTrust)
}

/**
 * Alliance bonuses: troops grow 30 % faster with an ally, and every line to an ally raises the ceiling
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const applyPactEffects = (state: ConcordatState): void => {
  const lines = new Map<number, number>()
  for (const route of state.routes) {
    if (!route.isAlliance || route.isCut) continue
    for (const owner of [route.a, route.b]) lines.set(owner, (lines.get(owner) ?? 0) + 1)
  }

  // One bonus per allied nation, however many allies it has
  const allied = new Set<number>()
  for (const tie of state.relations) {
    if (tie.kind === ConcordatTies.Alliance) allied.add(tie.a).add(tie.b)
  }
  for (const id of allied) {
    if (state.players[id - 1]?.alive) state.effects[id - 1].growth += pact.growth
  }
  for (const [owner, count] of lines) {
    state.effects[owner - 1].cap += Math.min(count, pact.maxLines) * pact.capPerLine
  }
}
