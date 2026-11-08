import 'server-only'

import { personaOf, withTypo } from '@/core/bots/play/persona'
import { between, latest, pauseAfter, pickOne, seeded } from '@/core/bots/play/random'
import { BaccalaureatPhases, fitsLetter } from '@/core/lib/play/baccalaureat'
import type { baccalaureatView } from '@/core/services/play/baccalaureat/BaccalaureatViewService'
import { isBaccalaureatCategory } from '@/declarations/play/baccalaureat/categories'
import type { BaccalaureatCategoryKey } from '@/declarations/play/baccalaureat/categories'
import { BACCALAUREAT_BOT_LEXICON } from '@/declarations/play/baccalaureat/lexicon'
import { BACCALAUREAT_BOT_EXTRA } from '@/declarations/play/baccalaureat/lexiconExtra'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotKindName } from '@/utils/constants/play'
import type { PlayBotMove, PlayBotStrategy } from '@/types/play'

// Latest writing moment
const MAX_SHARE = 0.97

// Cap on doubtful acceptance
const MAX_LENIENCY = 0.7

type BacBoardView = Awaited<ReturnType<typeof baccalaureatView>>
type BacRound = NonNullable<BacBoardView['round']>

/**
 * Word this bot likes, its own order
 * @param {Object} pick - Category and letter
 * @param {string} pick.botId - Bot
 * @param {BaccalaureatCategoryKey} pick.id - Category
 * @param {string} pick.letter - Round letter
 * @return {string | undefined} - Word
 */

const favouriteWord = ({
  botId,
  id,
  letter,
}: {
  botId: string
  id: BaccalaureatCategoryKey
  letter: string
}): string | undefined => {
  const pool = [...BACCALAUREAT_BOT_LEXICON[id], ...(BACCALAUREAT_BOT_EXTRA[id] ?? [])]
  const fitting = pool
    .filter((entry) => fitsLetter(entry, letter))
    .sort((left, right) => seeded(`${botId}:${id}:${left}`) - seeded(`${botId}:${id}:${right}`))

  // Mostly its first choice, sometimes a later one
  return fitting[Math.floor(Math.random() ** 2 * fitting.length)]
}

/**
 * Word that misses the letter
 * @param {BaccalaureatCategoryKey} id - Category
 * @param {string} letter - Round letter
 * @return {string | undefined} - Wrong word
 */

const wrongWord = (id: BaccalaureatCategoryKey, letter: string): string | undefined =>
  pickOne(BACCALAUREAT_BOT_LEXICON[id].filter((entry) => !fitsLetter(entry, letter)))

/**
 * Words of a round, holes and slips included
 * @param {BacBoardView} board - Board
 * @param {Object} turn - Bot
 * @param {string} turn.botId - Bot
 * @param {PlayBotKindName} turn.level - Level
 * @return {Record<string, string>} - Answers per category
 */

const answersFor = (
  board: BacBoardView,
  { botId, level }: { botId: string; level: PlayBotKindName }
): Record<string, string> => {
  const letter = board.round?.letter ?? ''
  const persona = personaOf(botId)
  const settings = PLAY_BOT_SETTINGS.baccalaureat
  const holeRate = Math.min(0.9, Math.max(0.02, settings.holeRate[level] + persona.bold))
  const answers: Record<string, string> = {}
  for (const { id } of board.settings.categories) {
    if (!isBaccalaureatCategory(id)) continue
    if (Math.random() < holeRate) continue

    // Wrong letter, rarely
    const isBlunder = Math.random() < settings.blunderRate[level] * persona.sloppy
    const word = isBlunder ? wrongWord(id, letter) : favouriteWord({ botId, id, letter })
    if (!word) continue

    // Typo, sometimes
    answers[id] = Math.random() < settings.typoRate[level] * persona.sloppy ? withTypo(word) : word
  }

  return answers
}

/**
 * Write once, late in the round
 * @param {BacBoardView} board - Board
 * @param {Object} turn - Bot
 * @param {string} turn.botId - Bot
 * @param {PlayBotKindName} turn.level - Level
 * @param {Date} turn.now - Clock
 * @return {PlayBotMove | null} - Move
 */

const writeMove = (
  board: BacBoardView,
  { botId, level, now }: { botId: string; level: PlayBotKindName; now: Date }
): PlayBotMove | null => {
  const round = board.round as BacRound
  if (round.answers.some((answer) => answer.accountId === botId)) return null
  const answers = answersFor(board, { botId, level })
  if (!Object.keys(answers).length) return null

  // Share of the writing time
  const startsAt = new Date(round.startsAt).getTime()
  const span = new Date(round.endsAt).getTime() - startsAt
  const share = between(PLAY_BOT_SETTINGS.baccalaureat.writeAt[level]) * personaOf(botId).pace
  const at = new Date(startsAt + span * Math.min(share, MAX_SHARE))

  return { key: `write:${round.index}`, raw: { type: 'write', answers }, at: latest(now, at) }
}

/**
 * Vote on the next unread answer
 * @param {BacBoardView} board - Board
 * @param {string} botId - Bot
 * @param {Date} now - Clock
 * @return {PlayBotMove | null} - Move
 */

const voteMove = (board: BacBoardView, botId: string, now: Date): PlayBotMove | null => {
  const round = board.round as BacRound
  const answer = round.answers.find(
    (entry) => entry.accountId !== botId && entry.word && entry.myVote === null
  )
  if (!answer) return null

  // Doubtful words pass for the easygoing
  const isDoubtful = answer.inDictionary === false
  const accepted =
    fitsLetter(answer.word, round.letter) &&
    (!isDoubtful || Math.random() < personaOf(botId).leniency * MAX_LENIENCY)

  return {
    key: `vote:${answer.id}`,
    raw: { type: 'vote', answerId: answer.id, accepted },
    at: pauseAfter(now, PLAY_BOT_SETTINGS.baccalaureat.voteMs),
  }
}

/**
 * Baccalaureat bot, lexicon with holes
 * @type {PlayBotStrategy}
 */

export const BACCALAUREAT_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as BacBoardView
    const phase = board.round?.phase
    if (phase === BaccalaureatPhases.Countdown || phase === BaccalaureatPhases.Writing)
      return writeMove(board, { botId, level, now })
    if (phase === BaccalaureatPhases.Review) return voteMove(board, botId, now)

    return null
  },
}
