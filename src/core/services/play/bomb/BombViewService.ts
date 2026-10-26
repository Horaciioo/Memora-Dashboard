import 'server-only'

import { prisma } from '@/core/lib/db'
import { bombSettingsOf, isTableOver } from '@/core/lib/play/bomb'
import { BOMB_SETTINGS } from '@/declarations/play'
import type { BombMissReason } from '@/declarations/play'
import type { EngineSession } from '@/types/play'

/**
 * Board of a Bomb Party game, the fuse kept secret
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const bombView = async (session: EngineSession, viewerId: string) => {
  const where = { sessionId: session.id }
  const [table, seats, moves, words, lasts] = await Promise.all([
    prisma.bombGame.findUnique({ where }),
    prisma.bombPlayer.findMany({ where, orderBy: { order: 'asc' } }),
    prisma.bombMove.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: BOMB_SETTINGS.feedSize,
    }),
    prisma.bombMove.groupBy({ by: ['accountId'], where: { ...where, kind: 'WORD' }, _count: true }),
    prisma.bombMove.findMany({
      where: { ...where, kind: 'WORD' },
      orderBy: { createdAt: 'desc' },
      distinct: ['accountId'],
      select: { accountId: true, word: true },
    }),
  ])
  const present = new Set(session.players)
  const alive = seats.filter((seat) => seat.lives > 0 && present.has(seat.accountId))
  const now = new Date()

  return {
    settings: bombSettingsOf(session.settings),
    isCountdown: table ? now < table.startsAt : false,
    isOver: isTableOver(alive.length, seats.length),
    startsAt: table?.startsAt ?? now,
    prompt: table?.prompt ?? '',
    turnId: table?.turnId ?? null,
    isMyTurn: table?.turnId === viewerId,
    draft: table?.draft ?? '',
    miss: table?.missWord
      ? { word: table.missWord, reason: table.missReason as BombMissReason }
      : null,
    blast: table?.blastAt && table.blastId ? { at: table.blastAt, accountId: table.blastId } : null,
    players: seats.map((seat) => ({
      accountId: seat.accountId,
      lives: seat.lives,
      letters: [...seat.letters],
      isOut: seat.lives <= 0,
      eliminatedAt: seat.eliminatedAt,
      hasLeft: !present.has(seat.accountId),
      lastWord: lasts.find((entry) => entry.accountId === seat.accountId)?.word ?? null,
      words: words.find((entry) => entry.accountId === seat.accountId)?._count ?? 0,
    })),
    feed: moves.map((move) => ({
      id: move.id,
      kind: move.kind,
      accountId: move.accountId,
      at: move.createdAt,
      values: { word: move.word ?? '', prompt: move.prompt.toUpperCase() },
    })),
    serverTime: now,
  }
}
