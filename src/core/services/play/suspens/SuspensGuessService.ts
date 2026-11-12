import 'server-only'

import { conflict, invalidInput } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { cellsOf, findPoints, foldLetter, hiddenCells, wordOf } from '@/core/lib/play/suspens'
import { endRound, passTurn, withTable } from '@/core/services/play/suspens/SuspensTable'
import type { SuspensTable } from '@/core/services/play/suspens/SuspensTable'
import { fillPlayMessage, PLAY_ERRORS, SUSPENS_SETTINGS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'
import { SuspensMoves } from '@/utils/constants/play'

// Characters read from a typed word, longer text is cut
const TYPED_MAX = 40

/**
 * Table open to the guesser on turn
 * @param {SuspensTable} table - Locked table
 * @param {string} accountId - Player
 * @return {string} - Capital word in play
 */

const requireTurn = ({ game, now }: SuspensTable, accountId: string): string => {
  if (game.word === null || game.revealUntil) throw conflict(PLAY_ERRORS.notGuessing)
  if (game.turnId !== accountId || !game.turnEndsAt || now >= game.turnEndsAt) {
    throw conflict(PLAY_ERRORS.notYourTurn)
  }

  return game.word
}

/**
 * A mistake: the move is kept, the figure takes a part, the round may end hanged
 * @param {SuspensTable} table - Locked table
 * @param {Object} move - What the guesser did
 * @param {string} move.accountId - Guesser
 * @param {string} move.kind - Move kind
 * @param {string | null} move.value - Letter or word tried
 * @param {string[]} [tried] - Letters tried once the move is played
 * @return {Promise<EngineStep>} - Step
 */

const fail = async (
  table: SuspensTable,
  move: { accountId: string; kind: string; value: string | null },
  tried: string[] = table.game.tried
): Promise<EngineStep> => {
  const { tx, session, settings, game } = table
  await tx.suspensMove.create({
    data: { sessionId: session.id, round: game.round, ...move, isHit: false },
  })
  const errors = game.errors + 1
  if (errors >= settings.errors) {
    return endRound(table, { errors, isSolved: false, solverId: null }, { tried })
  }

  return passTurn(table, { tried, errors })
}

/**
 * The guesser on turn ran out of time
 * @param {SuspensTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

export const expireTurn = (table: SuspensTable): Promise<EngineStep> =>
  fail(table, { accountId: table.game.turnId!, kind: SuspensMoves.Timeout, value: null })

/**
 * Play a letter: it fills every cell it stands in, or the figure takes a part
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the letter
 * @return {Promise<EngineStep>} - Step
 */

export const guessLetter = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const letter = foldLetter(readBodyText(raw, 'letter', PLAY_ERRORS.badLetter))
  if (!SUSPENS_SETTINGS.alphabet.includes(letter)) {
    throw invalidInput([{ field: 'letter', message: PLAY_ERRORS.badLetter }], PLAY_ERRORS.badLetter)
  }

  return withTable(session, async (table) => {
    const word = requireTurn(table, accountId)
    const { tx, game } = table
    if (game.tried.includes(letter)) throw conflict(PLAY_ERRORS.letterTried)

    const cells = cellsOf(word, letter)
    const tried = [...game.tried, letter]
    if (!cells) return fail(table, { accountId, kind: SuspensMoves.Letter, value: letter }, tried)

    const isSolve = hiddenCells(word, tried) === 0
    await tx.suspensMove.create({
      data: {
        sessionId: session.id,
        round: game.round,
        accountId,
        kind: SuspensMoves.Letter,
        value: letter,
        isHit: true,
        cells,
        points: findPoints(cells, isSolve),
      },
    })
    if (isSolve) {
      return endRound(
        table,
        { errors: game.errors, isSolved: true, solverId: accountId },
        { tried }
      )
    }

    return passTurn(table, { tried })
  })
}

/**
 * Play the whole word: right it completes the round, wrong it counts as an error
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the word
 * @return {Promise<EngineStep>} - Step
 */

export const guessWord = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const entry = wordOf(readBodyText(raw, 'word', PLAY_ERRORS.emptyWord).slice(0, TYPED_MAX))
  if (!entry) {
    throw invalidInput(
      [{ field: 'word', message: PLAY_ERRORS.wordLetters }],
      PLAY_ERRORS.wordLetters
    )
  }

  return withTable(session, async (table) => {
    const word = requireTurn(table, accountId)
    const { tx, game } = table
    // A word of another size is a slip, not a guess
    if (entry.word.length !== word.length) {
      const message = fillPlayMessage(PLAY_ERRORS.wordSize, { count: word.length })
      throw invalidInput([{ field: 'word', message }], message)
    }
    if (entry.word !== word) {
      return fail(table, { accountId, kind: SuspensMoves.Word, value: entry.word })
    }

    const cells = hiddenCells(word, game.tried)
    await tx.suspensMove.create({
      data: {
        sessionId: session.id,
        round: game.round,
        accountId,
        kind: SuspensMoves.Word,
        value: entry.word,
        isHit: true,
        cells,
        points: findPoints(cells, true),
      },
    })

    return endRound(table, { errors: game.errors, isSolved: true, solverId: accountId })
  })
}
