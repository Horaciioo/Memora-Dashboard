import 'server-only'

import type { BombGame, BombPlayer, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import {
  bombSettingsOf,
  fuseSeconds,
  gatherLetters,
  isTableOver,
  missOf,
  nextTurn,
  wordsNeeded,
} from '@/core/lib/play/bomb'
import type { BombGameSettings } from '@/core/lib/play/bomb'
import { drawPrompt } from '@/core/lib/play/bomb/prompts'
import { normalizeWord } from '@/core/lib/play/baccalaureat/words'
import { after, countdownEnd } from '@/core/lib/play/clock'
import { frenchWords } from '@/core/lib/play/dictionary'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { BOMB_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import type { EngineSession, EngineStep } from '@/types/play'

// Locked table of a game
interface BombTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: BombGameSettings
  table: BombGame
  seats: BombPlayer[]
  alive: BombPlayer[]
  now: Date
}

/**
 * Run work on the locked table
 * @param {EngineSession} session - Game
 * @param {(table: BombTable) => Promise<EngineStep>} work - Table work
 * @return {Promise<EngineStep>} - Step
 */

const withTable = (
  session: EngineSession,
  work: (table: BombTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const [table, seats] = await Promise.all([
      tx.bombGame.findUnique({ where: { sessionId: session.id } }),
      tx.bombPlayer.findMany({ where: { sessionId: session.id }, orderBy: { order: 'asc' } }),
    ])
    if (!table) throw notFound(PLAY_ERRORS.roundMissing)

    // Living and still seated
    const present = new Set(session.players)
    const alive = seats.filter((seat) => seat.lives > 0 && present.has(seat.accountId))

    return work({
      tx,
      session,
      settings: bombSettingsOf(session.settings),
      table,
      seats,
      alive,
      now: new Date(),
    })
  })

/**
 * Seat everyone, light the first fuse
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openTable = async (session: EngineSession): Promise<EngineStep> => {
  const settings = bombSettingsOf(session.settings)
  const prompt = await drawPrompt(wordsNeeded(settings))
  const startsAt = countdownEnd(new Date(), BOMB_SETTINGS.countdownSeconds)
  const explodesAt = after(startsAt, fuseSeconds(BOMB_SETTINGS.fuseSeconds))

  // Random seating around the bomb
  const order = session.players.toSorted(() => Math.random() - 0.5)
  await prisma.$transaction([
    prisma.bombPlayer.createMany({
      data: order.map((accountId, index) => ({
        sessionId: session.id,
        accountId,
        order: index,
        lives: settings.startLives,
      })),
    }),
    prisma.bombGame.create({
      data: { sessionId: session.id, prompt, turnId: order[0], startsAt, explodesAt },
    }),
  ])

  return { changed: true, finished: false, deadline: explodesAt }
}

/**
 * Final places written on the seats
 * @param {BombTable} table - Locked table
 * @return {Promise<EngineStep>} - Finished step
 */

const closeTable = async ({ tx, session, seats, alive }: BombTable): Promise<EngineStep> => {
  // Survivors first, then the latest out
  const out = seats
    .filter((seat) => seat.eliminatedAt)
    .toSorted((left, right) => left.eliminatedAt!.getTime() - right.eliminatedAt!.getTime())
  const scores = new Map([
    ...out.map((seat, index) => [seat.accountId, index + 1] as const),
    ...alive.map((seat) => [seat.accountId, seats.length + 1] as const),
  ])

  for (const [accountId, score] of scores) {
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId } },
      data: { score },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * Hand the bomb on
 * @param {BombTable} table - Locked table
 * @param {Prisma.BombGameUpdateInput} data - Table changes
 * @param {BombPlayer[]} [alive] - Living seats afterwards
 * @return {Promise<EngineStep>} - Step
 */

const passBomb = async (
  table: BombTable,
  data: Prisma.BombGameUpdateInput,
  alive = table.alive
): Promise<EngineStep> => {
  const current = table.seats.find((seat) => seat.accountId === table.table.turnId)
  const turnId = nextTurn(alive, current) ?? table.table.turnId
  const updated = await table.tx.bombGame.update({
    where: { sessionId: table.session.id },
    data: { turnId, draft: '', missWord: null, missReason: null, ...data },
  })

  return { changed: true, finished: false, deadline: updated.explodesAt }
}

/**
 * Fuse kept long enough for the next player
 * @param {BombTable} table - Locked table
 * @return {Date} - Explosion
 */

const fuseForNext = ({ table, settings, now }: BombTable): Date => {
  const floor = after(now, settings.minTurnSeconds)

  return table.explodesAt > floor ? table.explodesAt : floor
}

/**
 * The bomb goes off on the player on turn
 * @param {BombTable} table - Locked table
 * @return {Promise<EngineStep>} - Step
 */

const blast = async (table: BombTable): Promise<EngineStep> => {
  const { tx, session, settings, now } = table
  const holder = table.alive.find((seat) => seat.accountId === table.table.turnId)!

  const lives = holder.lives - 1
  await tx.bombPlayer.update({
    where: { id: holder.id },
    data: { lives, eliminatedAt: lives > 0 ? null : now },
  })
  await tx.bombMove.create({
    data: {
      sessionId: session.id,
      accountId: holder.accountId,
      kind: 'BLAST',
      prompt: table.table.prompt,
    },
  })

  // Seats as they stand after the blast
  const seats = table.seats.map((seat) =>
    seat.id === holder.id ? { ...seat, lives, eliminatedAt: lives > 0 ? null : now } : seat
  )
  const alive = table.alive.filter((seat) => seat.id !== holder.id || lives > 0)
  if (isTableOver(alive.length, seats.length)) return closeTable({ ...table, seats, alive })

  // Old prompts change hands
  const age = table.table.promptAge + 1
  const isStale = age >= settings.promptAge

  return passBomb(
    table,
    {
      prompt: isStale ? await drawPrompt(wordsNeeded(settings), table.table.prompt) : undefined,
      promptAge: isStale ? 0 : age,
      explodesAt: after(now, fuseSeconds(BOMB_SETTINGS.fuseSeconds)),
      blastAt: now,
      blastId: holder.accountId,
    },
    alive
  )
}

/**
 * Play every overdue move of the table
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const settleTable = (session: EngineSession): Promise<EngineStep> =>
  withTable(session, async (table) => {
    if (isTableOver(table.alive.length, table.seats.length)) return closeTable(table)

    // Player on turn walked away
    if (!table.alive.some((seat) => seat.accountId === table.table.turnId)) {
      return passBomb(table, { explodesAt: fuseForNext(table) })
    }
    if (table.now < table.table.explodesAt)
      return { ...IDLE_STEP, deadline: table.table.explodesAt }

    return blast(table)
  })

/**
 * Table open to the player on turn
 * @param {BombTable} table - Locked table
 * @param {string} accountId - Player
 * @return {void}
 */

const requireTurn = ({ table, now }: BombTable, accountId: string): void => {
  if (table.turnId !== accountId || now < table.startsAt) throw conflict(PLAY_ERRORS.notYourTurn)
  if (now >= table.explodesAt) throw conflict(PLAY_ERRORS.tooLate)
}

/**
 * Play a word on the prompt
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the word
 * @return {Promise<EngineStep>} - Step
 */

export const submitWord = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const typed = readBodyText(raw, 'word', PLAY_ERRORS.emptyWord).slice(0, BOMB_SETTINGS.wordLength)
  const word = normalizeWord(typed)

  return withTable(session, async (table) => {
    requireTurn(table, accountId)
    const { tx, settings } = table
    const [known, used] = await Promise.all([
      frenchWords(),
      tx.bombMove.count({ where: { sessionId: session.id, word } }),
    ])

    // Refused word stays on screen
    const miss = missOf({
      word,
      prompt: table.table.prompt,
      isKnown: known.has(word),
      isUsed: used > 0,
    })
    if (miss) {
      await tx.bombGame.update({
        where: { sessionId: session.id },
        data: { draft: typed, missWord: typed, missReason: miss },
      })

      return { ...IDLE_STEP, changed: true }
    }

    // Word counted, bonus letters gathered
    const seat = table.seats.find((entry) => entry.accountId === accountId)!
    const { letters, isComplete } = gatherLetters(seat.letters, word, settings.bonusAlphabet)
    const isHealed = isComplete && seat.lives < settings.maxLives
    await tx.bombMove.create({
      data: { sessionId: session.id, accountId, kind: 'WORD', word, prompt: table.table.prompt },
    })
    await tx.bombPlayer.update({
      where: { id: seat.id },
      data: { letters, lives: isHealed ? seat.lives + 1 : seat.lives },
    })
    if (isHealed) {
      await tx.bombMove.create({
        data: { sessionId: session.id, accountId, kind: 'LIFE', prompt: table.table.prompt },
      })
    }

    return passBomb(table, {
      prompt: await drawPrompt(wordsNeeded(settings), table.table.prompt),
      promptAge: 0,
      explodesAt: fuseForNext(table),
    })
  })
}

/**
 * Show what the player on turn types
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the text
 * @return {Promise<EngineStep>} - Step
 */

export const typeDraft = async (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const draft = typeof raw.text === 'string' ? raw.text.slice(0, BOMB_SETTINGS.wordLength) : ''
  const { count } = await prisma.bombGame.updateMany({
    where: { sessionId: session.id, turnId: accountId, draft: { not: draft } },
    data: { draft, missWord: null, missReason: null },
  })

  return { ...IDLE_STEP, changed: count > 0 }
}
