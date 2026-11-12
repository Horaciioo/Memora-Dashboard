import 'server-only'

import { prisma } from '@/core/lib/db'
import { maskOf, phaseOf, suspensSettingsOf, wrongLetters } from '@/core/lib/play/suspens'
import { SUSPENS_SETTINGS } from '@/declarations/play'
import type { EngineSession } from '@/types/play'
import { SuspensMoves, SuspensPhases } from '@/utils/constants/play'

/**
 * Feed kind of a move
 * @param {{ kind: string, isHit: boolean }} move - Move
 * @return {string} - Kind keyed in the feed copy
 */

const kindOf = ({ kind, isHit }: { kind: string; isHit: boolean }): string => {
  if (kind === SuspensMoves.Timeout) return 'TIMEOUT'

  return `${kind}_${isHit ? 'HIT' : 'MISS'}`
}

/**
 * Boards of a Suspens game read once, the word kept back from all but its setter
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of each reader
 */

export const suspensBoards = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const [game, moves, rounds] = await Promise.all([
    prisma.suspensGame.findUnique({ where }),
    prisma.suspensMove.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.suspensRound.findMany({ where, orderBy: { round: 'asc' } }),
  ])
  const settings = suspensSettingsOf(session.settings)
  const now = new Date()
  const round = game?.round ?? 1
  const phase = game ? phaseOf(game) : SuspensPhases.Pick
  const revealUntil = game?.revealUntil ?? null
  const word = game?.word ?? null
  const display = game?.display ?? ''
  const tried = game?.tried ?? []
  const closed = rounds.find((entry) => entry.round === round)

  // Everyone seated, plus whoever scored and left
  const accounts = [
    ...new Set([
      ...session.players,
      ...moves.map((entry) => entry.accountId),
      ...rounds.map((entry) => entry.setterId),
    ]),
  ]
  const players = accounts.map((accountId) => {
    const own = moves.filter((entry) => entry.accountId === accountId)
    const set = rounds.filter((entry) => entry.setterId === accountId)

    return {
      accountId,
      score:
        own.reduce((sum, entry) => sum + entry.points, 0) +
        set.reduce((sum, entry) => sum + entry.points, 0),
      found: own.filter((entry) => entry.isHit).length,
      set: set.length,
      hasLeft: !session.players.includes(accountId),
    }
  })

  const lines = [
    ...moves.map((entry) => ({
      id: entry.id,
      kind: kindOf(entry),
      accountId: entry.accountId,
      at: entry.createdAt,
      values: { letter: entry.value ?? '', word: entry.value ?? '', points: entry.points },
    })),
    ...rounds.map((entry) => ({
      id: entry.id,
      kind: entry.isSolved ? 'SOLVED' : 'HANGED',
      accountId: entry.setterId,
      at: entry.createdAt,
      values: { word: entry.word.toUpperCase(), points: entry.points },
    })),
  ]

  const base = {
    settings,
    serverTime: now,
    round,
    rounds: game?.rounds ?? 0,
    phase,
    startsAt: game?.startsAt ?? now,
    pickEndsAt: game?.pickEndsAt ?? now,
    turnEndsAt: game?.turnEndsAt ?? null,
    revealUntil,
    isOver: Boolean(game && revealUntil && round >= game.rounds && now >= revealUntil),
    setterId: game?.setterId ?? null,
    turnId: game?.turnId ?? null,
    turnNo: game?.turnNo ?? 0,
    errors: game?.errors ?? 0,
    allowed: settings.errors,
    length: Array.from(display).length,
    // Cells with the letters found, hidden ones empty
    mask: word ? maskOf(word, display, tried) : [],
    tried,
    wrong: word ? wrongLetters(word, tried) : [],
    reveal:
      game && revealUntil
        ? {
            word: display.toUpperCase(),
            isSolved: closed?.isSolved ?? false,
            solverId: closed?.solverId ?? null,
            setterId: game.setterId,
            setterPoints: closed?.points ?? 0,
          }
        : null,
    players,
    feed: lines
      .toSorted((left, right) => right.at.getTime() - left.at.getTime())
      .slice(0, SUSPENS_SETTINGS.feedSize),
  }

  return (viewerId: string) => ({
    ...base,
    // The setter alone reads the word while it is searched
    word: viewerId === base.setterId && phase === SuspensPhases.Play ? display.toUpperCase() : null,
    isMyTurn: base.turnId === viewerId && phase === SuspensPhases.Play,
  })
}

/**
 * Board of a Suspens game for one reader
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const suspensView = async (session: EngineSession, viewerId: string) =>
  (await suspensBoards(session))(viewerId)
