import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { listPlayHistory } from '@/core/services/play/HistoryService'
import { readPlayPresence, readPlayProfile } from '@/core/services/play/ProfileService'
import { PLAY_ERRORS, PLAY_SETTINGS } from '@/declarations/play'
import type { PlayCardView } from '@/types/play'

/**
 * Card of a player: portrait, level, figures and last games
 * @param {string} accountId - Player
 * @return {Promise<PlayCardView>} - Card
 */

export const readPlayCard = async (accountId: string): Promise<PlayCardView> => {
  const [account, profile, presence, stored, history] = await Promise.all([
    prisma.account.findUnique({
      where: { id: accountId },
      select: { displayName: true, avatarUrl: true, anonymisedAt: true, botKind: true },
    }),
    readPlayProfile(accountId),
    readPlayPresence(accountId),
    prisma.playProfile.findUnique({ where: { accountId }, select: { lastSeenAt: true } }),
    listPlayHistory(accountId, { size: PLAY_SETTINGS.cardRecent }),
  ])
  if (!account || account.anonymisedAt || account.botKind) throw notFound(PLAY_ERRORS.unknownPlayer)
  const { global } = profile

  return {
    accountId,
    name: account.displayName,
    avatarUrl: account.avatarUrl,
    level: global.level,
    xp: global.xp,
    played: global.played,
    wins: global.wins,
    winRate: global.winRate,
    bestStreak: global.bestStreak,
    lastSeenAt: stored?.lastSeenAt?.toISOString() ?? null,
    presence,
    recent: history.entries.map(({ sessionId, game, outcome, rank, players, finishedAt, xp }) => ({
      sessionId,
      game,
      outcome,
      rank,
      players,
      finishedAt,
      xp,
    })),
  }
}
