import 'server-only'

import { prisma } from '@/core/lib/db'
import { croquisSettingsOf, secondsLabel, shapeOf } from '@/core/lib/play/croquis'
import type { CroquisStroke } from '@/core/lib/play/croquis'
import { CROQUIS_SETTINGS } from '@/declarations/play'
import type { EngineSession } from '@/types/play'

/**
 * Everything a reader needs, the word kept back until the reveal
 * @param {EngineSession} session - Game
 * @return {Promise<Object>} - Shared board and the hidden word
 */

const readTable = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const [game, guesses, rounds] = await Promise.all([
    prisma.croquisGame.findUnique({ where }),
    prisma.croquisGuess.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.croquisRound.findMany({ where, orderBy: { round: 'asc' } }),
  ])
  const settings = croquisSettingsOf(session.settings)
  const now = new Date()
  const round = game?.round ?? 1
  const revealUntil = game?.revealUntil ?? null
  const drawerId = game?.drawerId ?? null
  const current = guesses.filter((entry) => entry.round === round)
  const closed = rounds.find((entry) => entry.round === round)

  // Everyone seated, plus whoever scored and left
  const accounts = [
    ...new Set([
      ...session.players,
      ...guesses.map((entry) => entry.accountId),
      ...rounds.map((entry) => entry.drawerId),
    ]),
  ]
  const players = accounts.map((accountId) => {
    const found = guesses.filter((entry) => entry.accountId === accountId)
    const drawn = rounds.filter((entry) => entry.drawerId === accountId)
    const guess = current.find((entry) => entry.accountId === accountId)

    return {
      accountId,
      score:
        found.reduce((sum, entry) => sum + entry.points, 0) +
        drawn.reduce((sum, entry) => sum + entry.points, 0),
      found: found.length,
      drawn: drawn.length,
      hasLeft: !session.players.includes(accountId),
      // State on this round
      isDrawer: accountId === drawerId,
      rank: guess?.rank ?? null,
      gain: accountId === drawerId ? (closed?.points ?? 0) : (guess?.points ?? 0),
    }
  })

  const lines = [
    ...guesses.map((entry) => ({
      id: entry.id,
      kind: 'FOUND',
      accountId: entry.accountId,
      at: entry.createdAt,
      // The word stays out of the line until its round is over
      values: { seconds: secondsLabel(entry.ms), points: entry.points },
    })),
    ...rounds.map((entry) => ({
      id: entry.id,
      kind: entry.solvers > 0 ? 'DRAWN' : 'MISSED',
      accountId: entry.drawerId,
      at: entry.createdAt,
      values: { word: entry.word.toUpperCase(), count: entry.solvers, points: entry.points },
    })),
  ]

  const base = {
    settings,
    serverTime: now,
    round,
    rounds: game?.rounds ?? 0,
    startsAt: game?.startsAt ?? now,
    endsAt: game?.endsAt ?? now,
    revealUntil,
    isOver: Boolean(game && revealUntil && round >= game.rounds && now >= revealUntil),
    drawerId,
    // Parts of the word with their letters, the hint opens the first one
    shape: game ? shapeOf(game.display) : [],
    hint: game?.isHinted && settings.hasHint ? Array.from(game.display)[0].toUpperCase() : null,
    strokes: (game?.strokes ?? []) as unknown as CroquisStroke[],
    reveal:
      game && revealUntil
        ? {
            word: game.display.toUpperCase(),
            drawerId: game.drawerId,
            solvers: closed?.solvers ?? 0,
            drawerPoints: closed?.points ?? 0,
          }
        : null,
    players,
    feed: lines
      .toSorted((left, right) => right.at.getTime() - left.at.getTime())
      .slice(0, CROQUIS_SETTINGS.feedSize),
  }

  return { base, word: game?.display.toUpperCase() ?? '' }
}

/**
 * Board of a Croquis game: the same drawing for all, the word for the drawer only
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of each reader
 */

export const croquisBoards = async (session: EngineSession) => {
  const { base, word } = await readTable(session)

  return (viewerId: string) => ({
    ...base,
    word: viewerId === base.drawerId && !base.reveal ? word : null,
  })
}

/**
 * Board of a Croquis game, as seen by one reader
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const croquisView = async (session: EngineSession, viewerId: string) =>
  (await croquisBoards(session))(viewerId)

/**
 * Board read by the bots: the word on top of what everyone sees
 * @param {EngineSession} session - Game
 * @return {Promise<object>} - Board with its secret
 */

export const croquisBotView = async (session: EngineSession) => {
  const { base, word } = await readTable(session)

  return { ...base, secret: { word } }
}
