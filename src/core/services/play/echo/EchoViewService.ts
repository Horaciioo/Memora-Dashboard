import 'server-only'

import { prisma } from '@/core/lib/db'
import { ECHO_DECK, answerOf, echoSettingsOf } from '@/core/lib/play/echo'
import type { EchoDeal } from '@/core/lib/play/echo'
import { ECHO_SETTINGS, ECHO_SYMBOLS } from '@/declarations/play'
import type { EngineSession } from '@/types/play'

/**
 * Board of an Echo game, cards are public so every reader sees the same
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of each reader
 */

export const echoBoards = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const [game, finds] = await Promise.all([
    prisma.echoGame.findUnique({ where }),
    prisma.echoFind.findMany({ where, orderBy: { createdAt: 'asc' } }),
  ])
  const settings = echoSettingsOf(session.settings)
  const now = new Date()
  const deal = (game?.deal ?? { center: 0, hands: {}, seed: 0 }) as unknown as EchoDeal
  const locks = (game?.locks ?? {}) as Record<string, string>
  const revealUntil = game?.revealUntil ?? null
  const round = game?.round ?? 1
  const current = finds.filter((entry) => entry.round === round)

  // Everyone seated, plus whoever scored and left
  const accounts = [...new Set([...session.players, ...finds.map((entry) => entry.accountId)])]
  const players = accounts.map((accountId) => {
    const mine = finds.filter((entry) => entry.accountId === accountId)
    const find = current.find((entry) => entry.accountId === accountId)

    return {
      accountId,
      score: mine.reduce((sum, entry) => sum + entry.points, 0),
      found: mine.length,
      hasLeft: !session.players.includes(accountId),
      // Result on this round
      rank: find?.rank ?? null,
      gain: find?.points ?? 0,
      lockedUntil: locks[accountId] ?? null,
    }
  })

  const base = {
    settings,
    serverTime: now,
    round,
    rounds: settings.rounds,
    startsAt: game?.startsAt ?? now,
    endsAt: game?.endsAt ?? now,
    revealUntil,
    isOver: Boolean(game && revealUntil && round >= settings.rounds && now >= revealUntil),
    seed: deal.seed,
    center: ECHO_DECK[deal.center] ?? [],
    hands: Object.entries(deal.hands).map(([accountId, card]) => ({
      accountId,
      card: ECHO_DECK[card],
      // Symbol shared with the center, named once the round is over
      answer: revealUntil ? answerOf(deal, accountId) : null,
    })),
    players,
    feed: finds
      .toReversed()
      .slice(0, ECHO_SETTINGS.feedSize)
      .map((entry) => ({
        id: entry.id,
        kind: 'FOUND',
        accountId: entry.accountId,
        at: entry.createdAt,
        values: {
          symbol: ECHO_SYMBOLS[entry.symbol].label.toLowerCase(),
          seconds: Math.round(entry.ms / 100) / 10,
          points: entry.points,
        },
      })),
  }

  return () => base
}

/**
 * Board of an Echo game, the same for every reader
 * @param {EngineSession} session - Game
 * @return {Promise<object>} - Board
 */

export const echoView = async (session: EngineSession) => (await echoBoards(session))()
