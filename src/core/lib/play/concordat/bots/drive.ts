import { offerIntent } from '@/core/lib/play/concordat/queue'
import type { ConcordatQueue } from '@/core/lib/play/concordat/queue'
import { tileNoise } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { economyMoves } from '@/core/lib/play/concordat/bots/economy'
import { betrayalMove, militaryMoves } from '@/core/lib/play/concordat/bots/military'
import { botProfileOf } from '@/core/lib/play/concordat/bots/profile'
import { seaMoves } from '@/core/lib/play/concordat/bots/sea'
import { answerMoves, proposeMoves } from '@/core/lib/play/concordat/bots/talks'
import { tribeMemoryOf, tribeMoves } from '@/core/lib/play/concordat/bots/tribe'
import type { ConcordatTribeMemory } from '@/core/lib/play/concordat/bots/tribe'
import { botViewOf } from '@/core/lib/play/concordat/bots/view'
import type { ConcordatBotContext } from '@/core/lib/play/concordat/bots/view'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatPhases, ConcordatPowers } from '@/utils/constants/concordat'
import type { ConcordatBotLevelName } from '@/utils/constants/concordat'

const { bots } = CONCORDAT

/**
 * What a bot remembers between two decisions, never saved
 * @typedef {Object} ConcordatBotMemory
 */

interface ConcordatBotMemory {
  nextAt: number
  lastProposal: Map<number, number>
}

// Memory per game, dropped with the game
const memories = new WeakMap<ConcordatState, Map<number, ConcordatBotMemory>>()

// Tribe memory per game, dropped with the game
const tribeMemories = new WeakMap<ConcordatState, Map<number, ConcordatTribeMemory>>()

const memoryOf = (state: ConcordatState, playerId: number): ConcordatBotMemory => {
  const game = memories.get(state) ?? new Map<number, ConcordatBotMemory>()
  memories.set(state, game)

  // First decision is spread over the first seconds
  const known = game.get(playerId)
  if (known) return known

  const fresh = {
    nextAt: state.tick + Math.floor(tileNoise(playerId, 1) * ticksOf(3)),
    lastProposal: new Map<number, number>(),
  }
  game.set(playerId, fresh)

  return fresh
}

/**
 * Commands one nation decides now, in order of importance
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @param {boolean} isCaretaker - Human away, played prudently
 * @param {ConcordatBotMemory} [memory] - Memory of the nation
 * @param {ConcordatBotLevelName} [asked] - Level of its bot account
 * @return {ConcordatIntent[]} - Commands
 */

export const decideBot = (
  state: ConcordatState,
  playerId: number,
  isCaretaker = false,
  memory: ConcordatBotMemory = memoryOf(state, playerId),
  asked?: ConcordatBotLevelName
): ConcordatIntent[] => {
  const context: ConcordatBotContext = {
    state,
    profile: botProfileOf(state.map.seed, playerId, asked),
    view: botViewOf(state, playerId),
    isCaretaker,
    roll: (salt) => tileNoise(playerId * 104729 + salt, state.tick),
  }

  const betrayal = betrayalMove(context)

  return [
    ...answerMoves(context),
    ...(betrayal ? [betrayal] : []),
    ...militaryMoves(context),
    ...seaMoves(context),
    ...proposeMoves(context, memory.lastProposal),
    ...economyMoves(context),
  ].slice(0, bots.maxIntents + context.state.offers.length)
}

// One tribe, light and slow
const driveTribe = (
  state: ConcordatState,
  queue: ConcordatQueue,
  now: number,
  playerId: number
): void => {
  if (!state.players[playerId - 1].alive) return

  const game = tribeMemories.get(state) ?? new Map<number, ConcordatTribeMemory>()
  tribeMemories.set(state, game)
  const memory = game.get(playerId) ?? tribeMemoryOf(state, playerId)
  game.set(playerId, memory)
  if (state.tick < memory.nextAt) return

  // Next thought comes later
  const [min, max] = CONCORDAT.powers.tribe.thinkTicks
  memory.nextAt = state.tick + min + Math.floor(tileNoise(playerId, state.tick) * (max - min))
  for (const intent of tribeMoves(state, playerId, memory)) {
    if (offerIntent(queue, intent, now)) break
  }
}

/**
 * Let every bot, and every human away, play its turn of thought
 * @param {ConcordatState} state - Game
 * @param {ConcordatQueue} queue - Queue shared with the humans
 * @param {number} now - Clock in ms
 * @param {ReadonlySet<number>} away - Nations of humans away
 * @param {ReadonlySet<number>} [seated] - Level of each nation held by a bot account, those without an account are bots too
 * @return {void}
 */

export const driveBots = (
  state: ConcordatState,
  queue: ConcordatQueue,
  now: number,
  away: ReadonlySet<number>,
  seated: ReadonlyMap<number, ConcordatBotLevelName> = new Map()
): void => {
  if (state.phase !== ConcordatPhases.Playing) return

  for (const player of state.players) {
    if (player.kind === ConcordatPowers.Tribe) {
      driveTribe(state, queue, now, player.id)
      continue
    }
    const isBot = player.accountId === null || seated.has(player.id)
    const isCaretaker = !isBot
    if (!player.alive || (isCaretaker && !away.has(player.id))) continue

    const memory = memoryOf(state, player.id)
    if (state.tick < memory.nextAt) continue

    // Same queue and same checks as a human, no side door
    const asked = seated.get(player.id) ?? player.level
    const [min, max] =
      bots.levels[botProfileOf(state.map.seed, player.id, asked).level].thinkSeconds
    memory.nextAt = state.tick + ticksOf(min + tileNoise(player.id, state.tick) * (max - min))
    for (const intent of decideBot(state, player.id, isCaretaker, memory, asked)) {
      if (offerIntent(queue, intent, now)) break
    }
  }
}
