import 'server-only'

import { personaOf } from '@/core/bots/play/persona'
import { latest, pauseAfter, seeded } from '@/core/bots/play/random'
import { frenchWords } from '@/core/lib/play/dictionary'
import { foldLetter } from '@/core/lib/play/suspens'
import type { suspensView } from '@/core/services/play/suspens/SuspensViewService'
import { SUSPENS_SETTINGS } from '@/declarations/play'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'
import { SuspensPhases } from '@/utils/constants/play'

type SuspensBotBoard = Awaited<ReturnType<typeof suspensView>>

// Share of the turn after which a bot never waits
const TURN_CEILING = 0.7

// Dictionary words by length, built once
const byLength = new Map<number, string[]>()

/**
 * Dictionary words of a length, plain letters only
 * @param {number} length - Letters
 * @return {Promise<string[]>} - Lowercase words
 */

const wordsOf = async (length: number): Promise<string[]> => {
  if (!byLength.size) {
    for (const word of await frenchWords()) {
      if (!/^[a-z]+$/.test(word)) continue
      const bucket = byLength.get(word.length) ?? []
      bucket.push(word)
      byLength.set(word.length, bucket)
    }
  }

  return byLength.get(length) ?? []
}

/**
 * Words that fit what the board shows: found letters in place, tried letters nowhere else
 * @param {string[]} words - Words of the right length
 * @param {SuspensBotBoard} board - Board
 * @return {string[]} - Candidates
 */

const fitting = (words: string[], board: SuspensBotBoard): string[] => {
  const tried = new Set(board.tried.map((letter) => letter.toLowerCase()))
  const cells = board.mask.map((cell) => (cell ? foldLetter(cell).toLowerCase() : null))

  return words.filter((word) =>
    cells.every((cell, index) => (cell ? word[index] === cell : !tried.has(word[index])))
  )
}

/**
 * Letter the candidates share the most, the common French ones first on a tie
 * @param {string[]} candidates - Words still possible
 * @param {string[]} free - Letters not tried yet
 * @return {string} - Letter
 */

const bestLetter = (candidates: string[], free: string[]): string => {
  const score = (letter: string) =>
    candidates.filter((word) => word.includes(letter.toLowerCase())).length

  return free.toSorted((left, right) => score(right) - score(left))[0]
}

/**
 * Suspens bot, reasons on the dictionary and slips by level
 * @type {PlayBotStrategy}
 */

export const SUSPENS_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as SuspensBotBoard
    if (board.isOver) return null

    const persona = personaOf(botId)
    const { min, max } = PLAY_BOT_SETTINGS.suspens.thinkMs
    const pause = (from: Date, ceilingSeconds: number) =>
      pauseAfter(latest(now, from), {
        min: Math.min(min * persona.pace, ceilingSeconds * SECOND_MS * TURN_CEILING),
        max: Math.min(max * persona.pace, ceilingSeconds * SECOND_MS * TURN_CEILING),
      })

    // Lazy setter lets the game choose
    if (board.phase === SuspensPhases.Pick) {
      if (board.setterId !== botId) return null

      return {
        key: `pick:${board.round}`,
        raw: { type: 'draw' },
        at: pause(new Date(board.startsAt), board.settings.pickSeconds),
      }
    }
    if (!board.isMyTurn) return null

    const turn = `${board.round}:${board.turnNo}`
    const free = SUSPENS_SETTINGS.alphabet.filter((letter) => !board.tried.includes(letter))
    if (!free.length) return null

    // A slip: any letter left
    const slip =
      seeded(`${botId}:${turn}`) < PLAY_BOT_SETTINGS.suspens.failRate[level] * persona.sloppy
    const candidates = slip ? [] : fitting(await wordsOf(board.length), board)
    const raw =
      candidates.length === 1
        ? { type: 'word', word: candidates[0] }
        : {
            type: 'letter',
            letter: slip
              ? free[Math.floor(seeded(`${botId}:${turn}:slip`) * free.length)]
              : candidates.length
                ? bestLetter(candidates, free)
                : (SUSPENS_SETTINGS.frequency.find((letter) => free.includes(letter)) ?? free[0]),
          }

    return {
      key: `move:${turn}`,
      raw,
      at: pause(new Date(now), board.settings.turnSeconds),
    }
  },
}
