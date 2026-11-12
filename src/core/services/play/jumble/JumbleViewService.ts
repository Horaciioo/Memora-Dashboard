import 'server-only'

import { prisma } from '@/core/lib/db'
import { jumbleSettingsOf, secondsLabel } from '@/core/lib/play/jumble'
import { JUMBLE_SETTINGS } from '@/declarations/play'
import type { EngineSession } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Board of a Jumble game, the answer kept back until the reveal
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of each reader
 */

export const jumbleBoards = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const [game, rounds] = await Promise.all([
    prisma.jumbleGame.findUnique({ where }),
    prisma.jumbleRound.findMany({ where, orderBy: { round: 'asc' } }),
  ])
  const settings = jumbleSettingsOf(session.settings)
  const now = new Date()
  const revealUntil = game?.revealUntil ?? null
  const isReveal = revealUntil !== null
  const totalMs = settings.roundSeconds * SECOND_MS
  const current = rounds.find((entry) => entry.round === game?.round)

  // Everyone seated, plus whoever scored and left
  const accounts = [
    ...new Set([...session.players, ...rounds.flatMap((entry) => entry.solverId ?? [])]),
  ]
  const players = accounts.map((accountId) => {
    const won = rounds.filter((entry) => entry.solverId === accountId)
    const last = rounds.at(-1)

    return {
      accountId,
      score: won.reduce((sum, entry) => sum + entry.points, 0),
      solved: won.length,
      // Streak alive after the latest round
      streak: last?.solverId === accountId ? last.streak : 0,
      hasLeft: !session.players.includes(accountId),
    }
  })

  const base = {
    settings,
    serverTime: now,
    round: game?.round ?? 1,
    rounds: settings.rounds,
    startsAt: game?.startsAt ?? now,
    endsAt: game?.endsAt ?? now,
    revealUntil,
    isOver: Boolean(game && revealUntil && game.round >= settings.rounds && now >= revealUntil),
    scrambled: game?.scrambled ?? '',
    length: game?.answer.length ?? 0,
    hint: game?.isHinted && settings.hasHint ? game.answer[0].toUpperCase() : null,
    reveal:
      game && isReveal
        ? {
            word: game.display.toUpperCase(),
            solverId: current?.solverId ?? null,
            ms: current?.ms ?? 0,
            points: current?.points ?? 0,
            streak: current?.streak ?? 0,
            isFlash:
              current?.solverId !== null &&
              (current?.ms ?? totalMs) / totalMs <= JUMBLE_SETTINGS.scoring.flashRatio,
          }
        : null,
    players,
    feed: rounds
      .toReversed()
      .slice(0, JUMBLE_SETTINGS.feedSize)
      .map((entry) => ({
        id: entry.id,
        kind: entry.solverId ? 'SOLVED' : 'MISSED',
        accountId: entry.solverId,
        at: entry.createdAt,
        values: {
          word: entry.word.toUpperCase(),
          seconds: secondsLabel(entry.ms),
          points: entry.points,
        },
      })),
  }

  return () => base
}

/**
 * Board of a Jumble game, the same for every reader
 * @param {EngineSession} session - Game
 * @return {Promise<object>} - Board
 */

export const jumbleView = async (session: EngineSession) => (await jumbleBoards(session))()
