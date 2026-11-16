import { intentRefusal } from '@/core/lib/play/concordat/sim/intents'
import { troopCap } from '@/core/lib/play/concordat/sim/economy'
import { tileNoise } from '@/core/lib/play/concordat/sim/rng'
import { botViewOf, isOpenTarget } from '@/core/lib/play/concordat/bots/view'
import { isPushing, zoneTileOf } from '@/core/lib/play/concordat/bots/zone'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatPlayerState, ConcordatState } from '@/types/concordat'

const { tribe: tribeRules, difficulties } = CONCORDAT.powers
const tribe = { ...tribeRules, difficulties }

/**
 * What a tribe remembers between two decisions, never saved
 * @typedef {Object} ConcordatTribeMemory
 */

export interface ConcordatTribeMemory {
  nextAt: number
  // Share of the ceiling that wakes it, then the share kept home
  trigger: number
  reserve: number
  // Percent of the troops one push sends
  expand: number
}

/**
 * Pace and push of the powers, from the temper chosen at the setup
 * @param {ConcordatState} state - Game
 * @return {{ tempo: number; push: number }} - Delay factor and engagement factor
 */

export const temperOf = (state: ConcordatState): { tempo: number; push: number } =>
  tribe.difficulties[state.temper ?? 'normal']

// Value between two bounds, stable for a tribe and a salt
const between = (range: readonly number[], playerId: number, salt: number): number =>
  range[0] + (range[1] - range[0]) * tileNoise(playerId * 7919 + salt, 17)

/**
 * Fresh memory of a tribe, its three ratios drawn once
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Tribe
 * @return {ConcordatTribeMemory} - Memory
 */

export const tribeMemoryOf = (state: ConcordatState, playerId: number): ConcordatTribeMemory => ({
  nextAt: state.tick + Math.floor(between(tribe.thinkTicks, playerId, 1) * temperOf(state).tempo),
  trigger: between(tribe.trigger, playerId, 2),
  reserve: between(tribe.reserve, playerId, 3),
  expand: Math.min(60, Math.round(between(tribe.expand, playerId, 4) * temperOf(state).push)),
})

// Neighbour worth a fight: the one that hit it, else a random open one, humans half the time
const rivalOf = (
  state: ConcordatState,
  player: ConcordatPlayerState,
  neighbours: { id: number }[]
): number => {
  const attacker = state.corps.find((corps) => corps.target === player.id && !corps.feint)
  if (attacker) return attacker.owner

  const open = neighbours.filter(({ id }) => isOpenTarget(state, player.id, id))
  const pick = open[Math.floor(tileNoise(player.id, state.tick) * open.length)]
  if (!pick) return -1

  // A wild tribe leaves seats alone half of the time
  const isSeat = state.players[pick.id - 1].kind === 'human'

  return isSeat && tileNoise(player.id + 3, state.tick) < 0.5 ? -1 : pick.id
}

/**
 * Commands of a tribe: take every alliance, hit back, then free land, then a neighbour
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Tribe
 * @param {ConcordatTribeMemory} memory - Its ratios
 * @return {ConcordatIntent[]} - Commands
 */

export const tribeMoves = (
  state: ConcordatState,
  playerId: number,
  memory: ConcordatTribeMemory
): ConcordatIntent[] => {
  const player = state.players[playerId - 1]
  const moves: ConcordatIntent[] = state.offers
    .filter((offer) => offer.to === playerId)
    .map((offer) => ({ kind: 'accept', playerId, offer: offer.id }))

  // Too few troops, stay home
  if (player.troops < troopCap(player) * memory.trigger) return moves
  if (player.troops * (1 - memory.expand / 100) < troopCap(player) * memory.reserve) return moves

  const view = botViewOf(state, playerId)
  const rival = rivalOf(state, player, view.neighbours)
  const target = rival > 0 ? rival : view.freeContact ? 0 : -1
  if (target < 0) return moves

  // One zone at a time, the next one only once this one is whole
  if (isPushing(state, playerId, target)) return moves
  const tile = zoneTileOf(state, playerId, target)
  if (tile < 0) return moves

  const push: ConcordatIntent = { kind: 'engage', playerId, target, percent: memory.expand, tile }
  if (!intentRefusal(state, push)) moves.push(push)

  return moves
}
