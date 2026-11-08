import 'server-only'

import { personaOf } from '@/core/bots/play/persona'
import { latest, pauseAfter, pickOne, seeded } from '@/core/bots/play/random'
import { frenchWords } from '@/core/lib/play/dictionary'
import type { bombView } from '@/core/services/play/bomb/BombViewService'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'

// Bots below this like short words
const PICKY = 0.4

type BombBoardView = Awaited<ReturnType<typeof bombView>>

/**
 * Unplayed word holding the syllable
 * @param {string} prompt - Syllable
 * @param {Set<string>} used - Words seen
 * @return {Promise<string | undefined>} - Word
 */

const wordFor = async (
  prompt: string,
  used: Set<string>,
  taste: number
): Promise<string | undefined> => {
  const fitting: string[] = []
  for (const word of await frenchWords()) {
    if (word.includes(prompt) && !word.includes(' ') && !used.has(word)) fitting.push(word)
  }

  // Short words or long ones, by taste
  fitting.sort((left, right) => left.length - right.length)
  const picked = pickOne(fitting)

  return taste < PICKY && fitting.length
    ? fitting[Math.floor(Math.random() ** 2 * fitting.length)]
    : picked
}

/**
 * Bomb Party bot, misses by level
 * @type {PlayBotStrategy}
 */

export const BOMB_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as BombBoardView
    if (board.isOver || !board.isMyTurn || !board.prompt) return null

    const persona = personaOf(botId)

    // Blank on this syllable, the bomb blows
    const turn = `${board.prompt}:${board.feed[0]?.id ?? ''}`
    if (seeded(`${botId}:${turn}`) < PLAY_BOT_SETTINGS.bomb.failRate[level] * persona.sloppy)
      return null

    // Words on screen and the refused one
    const used = new Set(board.feed.map((line) => line.values.word).filter(Boolean))
    if (board.miss) used.add(board.miss.word)
    const word = await wordFor(board.prompt, used, persona.taste)
    if (!word) return null

    return {
      key: `word:${turn}:${board.miss?.word ?? ''}`,
      raw: { type: 'submit', word },
      at: pauseAfter(latest(now, new Date(board.startsAt)), {
        min: PLAY_BOT_SETTINGS.bomb.thinkMs.min * persona.pace,
        max: PLAY_BOT_SETTINGS.bomb.thinkMs.max * persona.pace,
      }),
    }
  },
}
