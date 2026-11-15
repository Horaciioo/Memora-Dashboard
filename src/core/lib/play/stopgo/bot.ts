import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import { STOPGO_CARDS, StopGoFamilies, StopGoTargets } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { PlayBotKinds, StopGoPhases } from '@/utils/constants/play'
import type { PlayBotKindName } from '@/utils/constants/play'

import type { Random } from '@/core/lib/play/stopgo/deck'
import type { StopGoBoardView } from '@/core/lib/play/stopgo/view'

/**
 * Move a bot sends, tied to the board it read
 * @typedef {Object} StopGoBotMove
 * @property {string} key - Board state it answers
 * @property {Record<string, unknown>} raw - Action body
 */

export interface StopGoBotMove {
  key: string
  raw: Record<string, unknown>
}

/**
 * What a bot reads and who it is
 * @typedef {Object} StopGoBotInput
 */

export interface StopGoBotInput {
  board: StopGoBoardView
  botId: string
  level: PlayBotKindName
  random: Random
}

type Player = StopGoBoardView['players'][number]
type You = NonNullable<StopGoBoardView['you']>

// Playable card with the targets the server allows
interface Option {
  id: string
  key: StopGoCardKey
  targets: string[]
}

const TUNING = PLAY_BOT_SETTINGS.stopgo

/**
 * Move tied to the board revision
 * @param {StopGoBoardView} board - Board read
 * @param {string} name - Action name
 * @param {Record<string, unknown>} raw - Body without type and turn
 * @return {StopGoBotMove} - Move
 */

const move = (
  board: StopGoBoardView,
  name: string,
  raw: Record<string, unknown>
): StopGoBotMove => ({
  key: `${name}:${board.rev}`,
  raw: { ...raw, type: name, turnNo: board.turnNo },
})

/**
 * Bot is far enough along to guard its Immunity
 * @param {Player} me - Bot
 * @param {StopGoBoardView} board - Board
 * @param {PlayBotKindName} level - Level
 * @return {boolean} - Near the finish
 */

const isNear = (me: Player, board: StopGoBoardView, level: PlayBotKindName): boolean =>
  me.km >= board.target * TUNING.nearFinish[level]

/**
 * Immunity played against the attack aimed at the bot
 * @param {StopGoBotInput} input - Bot and board
 * @param {Player} me - Bot
 * @return {boolean} - Played
 */

const wantsImmunity = ({ board, level, random }: StopGoBotInput, me: Player): boolean => {
  const card = board.window?.card
  const isNearEnd = isNear(me, board, level)
  if (level === PlayBotKinds.Easy) return random() < 0.5

  // Medium saves it for an Accident or a red light near the finish
  if (level === PlayBotKinds.Medium) return (card === 'crash' || card === 'red') && isNearEnd

  return card === 'crash' || isNearEnd
}

/**
 * Worth of keeping a card
 * @param {StopGoCardKey} key - Card
 * @param {Player} me - Bot
 * @param {StopGoBoardView} board - Board
 * @return {number} - Worth
 */

const worthOf = (key: StopGoCardKey, me: Player, board: StopGoBoardView): number => {
  const spec = STOPGO_CARDS[key]
  if (spec.family === StopGoFamilies.Distance) {
    const km = spec.km ?? 0

    // A distance past the finish line never plays again
    return me.km + km > board.target ? 1 : 20 + km / 4
  }
  if (spec.family === StopGoFamilies.Remedy) {
    const isNeeded = spec.hazard && (me.hazards.includes(spec.hazard) || !me.isGreen)

    return isNeeded ? 300 : 5
  }

  return spec.family === StopGoFamilies.Attack ? 60 : 40
}

/**
 * Opponents still in the race
 * @param {StopGoBoardView} board - Board
 * @param {string} botId - Bot
 * @return {Player[]} - Opponents, leader first
 */

const rivalsOf = (board: StopGoBoardView, botId: string): Player[] =>
  board.players
    .filter((player) => player.accountId !== botId && !player.hasLeft)
    .sort((first, second) => second.km - first.km)

/**
 * Targets a card is sent at
 * @param {StopGoCardKey} key - Card
 * @param {string[]} aimable - Opponents the server allows
 * @param {string | undefined} preferred - Opponent to hit first
 * @return {string[]} - Targets
 */

const targetsOf = (key: StopGoCardKey, aimable: string[], preferred?: string): string[] => {
  const target = STOPGO_CARDS[key].target
  if (target === StopGoTargets.None) return []
  if (target === StopGoTargets.Many) return aimable

  return [preferred && aimable.includes(preferred) ? preferred : aimable[0]]
}

/**
 * Hand cards the server accepts, with their targets
 * @param {You} you - Private part
 * @return {Option[]} - Options
 */

const optionsOf = (you: You): Option[] =>
  you.hand
    .filter((card) => !card.isPicking && you.playable[card.id])
    .map((card) => ({ id: card.id, key: card.key, targets: you.playable[card.id] ?? [] }))

/**
 * Gap made exactly by some of the distances
 * @param {number} gap - Km to make
 * @param {number[]} kms - Distances in hand
 * @return {boolean} - Reachable
 */

const isReachable = (gap: number, kms: number[]): boolean => {
  const sums = new Set([0])
  for (const km of kms) for (const sum of [...sums]) sums.add(sum + km)

  return sums.has(gap)
}

/**
 * Score of a playable card, the best is played
 * @param {Option} option - Card and targets
 * @param {StopGoBotInput} input - Bot and board
 * @param {Player} me - Bot
 * @param {You} you - Private part
 * @return {number} - Score
 */

const scoreOf = (
  option: Option,
  { board, botId, level }: StopGoBotInput,
  me: Player,
  you: You
): number => {
  const spec = STOPGO_CARDS[option.key]
  const isHard = level === PlayBotKinds.Hard
  const km = spec.km ?? 0
  if (spec.family === StopGoFamilies.Remedy) return 1000
  if (spec.family === StopGoFamilies.Distance) {
    const gap = board.target - me.km - km
    if (!isHard) return 500 + km
    if (gap === 0) return 2000

    // Keep the cards that can still finish the race exactly
    const others = you.hand
      .filter((card) => card.id !== option.id)
      .map((card) => STOPGO_CARDS[card.key].km ?? 0)
      .filter(Boolean)
    const isLost = gap <= TUNING.finishZoneKm && !isReachable(gap, others)

    return 500 + km - (isLost ? 150 : 0)
  }
  if (spec.family === StopGoFamilies.Attack) {
    const threat = rivalsOf(board, botId)[0]
    const isThreat = isHard && !!threat && threat.km >= board.target - TUNING.threatKm

    return isThreat && option.targets.includes(threat.accountId) ? 900 : 200
  }

  return spec.target === StopGoTargets.One ? 80 : 100
}

/**
 * Joker or sealed card used before any card
 * @param {StopGoBotInput} input - Bot and board
 * @param {Player} me - Bot
 * @param {You} you - Private part
 * @return {StopGoBotMove | null} - Move or null
 */

const specialMove = (input: StopGoBotInput, me: Player, you: You): StopGoBotMove | null => {
  const { board, level } = input
  const isHard = level === PlayBotKinds.Hard
  const hasHeavyLoad =
    me.hazards.length >= 2 || (isHard && !!me.hazards.length && isNear(me, board, level))
  if (you.canCleanup && level !== PlayBotKinds.Easy && hasHeavyLoad) {
    return move(board, 'cleanup', {})
  }

  // Margin kept after paying the price of the reveal
  const isRich = me.km >= STOPGO_SETTINGS.mysteryCost + TUNING.revealMargin[level]

  return you.canReveal && isRich ? move(board, 'reveal', {}) : null
}

/**
 * Card thrown when nothing can be played
 * @param {StopGoBotInput} input - Bot and board
 * @param {Player} me - Bot
 * @param {You} you - Private part
 * @return {StopGoBotMove | null} - Move or null
 */

const discardMove = (input: StopGoBotInput, me: Player, you: You): StopGoBotMove | null => {
  const cards = you.hand.filter((card) => !card.isPicking)
  if (!cards.length) return null
  const { board, level, random } = input
  if (level === PlayBotKinds.Easy) {
    return move(board, 'discard', { cardId: cards[Math.floor(random() * cards.length)].id })
  }
  const [worst] = [...cards].sort((a, b) => worthOf(a.key, me, board) - worthOf(b.key, me, board))

  return move(board, 'discard', { cardId: worst.id })
}

/**
 * Card kept out of the two a Good draw offers
 * @param {StopGoBotInput} input - Bot and board
 * @param {Player} me - Bot
 * @param {You} you - Private part
 * @return {StopGoBotMove} - Move
 */

const pickMove = (input: StopGoBotInput, me: Player, you: You): StopGoBotMove => {
  const picks = you.hand.filter((card) => card.isPicking)
  const best =
    input.level === PlayBotKinds.Easy
      ? picks[0]
      : [...picks].sort(
          (a, b) => worthOf(b.key, me, input.board) - worthOf(a.key, me, input.board)
        )[0]

  return move(input.board, 'pick', { cardId: best?.id })
}

/**
 * Own turn: Joker, then the best card, else a discard
 * @param {StopGoBotInput} input - Bot and board
 * @param {Player} me - Bot
 * @param {You} you - Private part
 * @return {StopGoBotMove | null} - Move or null
 */

const turnMove = (input: StopGoBotInput, me: Player, you: You): StopGoBotMove | null => {
  const special = specialMove(input, me, you)
  if (special) return special

  const options = optionsOf(you)
  if (!options.length) return discardMove(input, me, you)
  const { board, botId, level } = input
  const isEasy = level === PlayBotKinds.Easy

  // The first card that works for the easy level
  const best = isEasy
    ? options[0]
    : [...options].sort((a, b) => scoreOf(b, input, me, you) - scoreOf(a, input, me, you))[0]
  const leader = rivalsOf(board, botId)[0]
  const targets = targetsOf(best.key, best.targets, isEasy ? undefined : leader?.accountId)

  return move(board, 'play', { cardId: best.id, targets })
}

/**
 * Move a Stop & Go bot sends from its own board
 * @param {StopGoBotInput} input - Bot and board
 * @return {StopGoBotMove | null} - Move, null when nothing is asked of it
 */

export const decideStopGo = (input: StopGoBotInput): StopGoBotMove | null => {
  const { board, botId } = input
  const me = board.players.find((player) => player.accountId === botId)
  const you = board.you
  if (board.phase !== StopGoPhases.Playing || !me || !you) return null

  // An attack aims at the bot, it answers before anything else
  if (board.window?.waiting.includes(botId)) {
    const isSaved = you.canImmunize && wantsImmunity(input, me)

    return move(board, isSaved ? 'immunity' : 'decline', {})
  }
  if (board.pickerId === botId) return pickMove(input, me, you)
  if (board.turnId !== botId || board.window || board.pickerId) return null

  return turnMove(input, me, you)
}
