import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden } from '@/core/lib/errors'
import { levelOf } from '@/core/lib/play'
import type { AdminActor } from '@/core/services/members/admin'
import { journalPlay } from '@/core/services/play/PlayJournalService'
import { integerOf, targetOf, writeBonus, writeXp } from '@/core/services/play/PlayAdminService'
import { PLAY_JOURNAL, PLAY_SETTINGS } from '@/declarations/play'
import type { PlayAdminBoard } from '@/types/play'

// Accounts that can still play
const PLAYING = ['ACADEMY', 'ACTIVE', 'PAUSED'] as const
// Accounts written at once
const BATCH = 20

/**
 * Every moderator with their global Play XP, richest first
 * @return {Promise<PlayAdminBoard>} - Rows and totals
 */

export const readPlayAdminBoard = async (): Promise<PlayAdminBoard> => {
  const [accounts, stats, profiles, trophies] = await Promise.all([
    prisma.account.findMany({
      where: { status: { in: [...PLAYING] } },
      select: { id: true, displayName: true, avatarUrl: true },
    }),
    prisma.playGameStat.groupBy({ by: ['accountId'], _sum: { xp: true, played: true } }),
    prisma.playProfile.findMany({ select: { accountId: true, bonusXp: true, bannedAt: true } }),
    prisma.playTrophyWin.groupBy({ by: ['accountId'], _sum: { xp: true } }),
  ])
  const gamesOf = new Map(stats.map((row) => [row.accountId, row._sum]))
  const profileOf = new Map(profiles.map((row) => [row.accountId, row]))
  const trophyOf = new Map(trophies.map((row) => [row.accountId, row._sum.xp ?? 0]))

  const players = accounts
    .map((account) => {
      const games = gamesOf.get(account.id)
      const profile = profileOf.get(account.id)
      const bonusXp = profile?.bonusXp ?? 0
      const xp = Math.max(0, (games?.xp ?? 0) + bonusXp + (trophyOf.get(account.id) ?? 0))

      return {
        accountId: account.id,
        name: account.displayName,
        avatarUrl: account.avatarUrl,
        xp,
        level: levelOf(xp).level,
        bonusXp,
        played: games?.played ?? 0,
        isBanned: Boolean(profile?.bannedAt),
      }
    })
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))

  return {
    players,
    totals: {
      players: players.length,
      active: players.filter((player) => player.played > 0).length,
      banned: players.filter((player) => player.isBanned).length,
      xp: players.reduce((sum, player) => sum + player.xp, 0),
    },
  }
}

/**
 * Give or take XP from every moderator at once, on a game or the global line
 * @param {AdminActor} actor - Admin acting
 * @param {Record<string, unknown>} raw - Body with game and amount
 * @return {Promise<number>} - Moderators touched
 */

export const adjustEveryonesXp = async (
  actor: AdminActor,
  raw: Record<string, unknown>
): Promise<number> => {
  // Only the admin level reaches everyone
  if (!actor.isAdmin) throw forbidden()

  const game = targetOf(raw)
  const limit = PLAY_SETTINGS.admin.maxXpChange
  const amount = integerOf(raw, 'amount', { min: -limit, max: limit })
  const accounts = await prisma.account.findMany({
    where: { status: { in: [...PLAYING] } },
    select: { id: true },
  })

  for (let at = 0; at < accounts.length; at += BATCH) {
    await Promise.all(
      accounts
        .slice(at, at + BATCH)
        .map(({ id }) =>
          game
            ? writeXp(id, game, (current) => current + amount)
            : writeBonus(id, (bonus) => bonus + amount)
        )
    )
  }
  await journalPlay(
    ...accounts.map(({ id }) => ({
      eventType: 'PlayAdjusted' as const,
      subjectId: id,
      actorId: actor.id,
      game: game ?? undefined,
      template: amount >= 0 ? PLAY_JOURNAL.xpAdded : PLAY_JOURNAL.xpRemoved,
      values: { amount: Math.abs(amount) },
    }))
  )

  return accounts.length
}
