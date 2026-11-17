import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput } from '@/core/lib/errors'
import { levelOf } from '@/core/lib/play'
import type { AdminActor } from '@/core/services/members/admin'
import { journalPlay } from '@/core/services/play/PlayJournalService'
import { integerOf, targetOf, writeBonus, writeXp } from '@/core/services/play/PlayAdminService'
import { PLAY_ERRORS, PLAY_JOURNAL, PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_ADMIN_TARGETS } from '@/declarations/play/admin'
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
  const [accounts, stats, profiles, trophies, youtubers] = await Promise.all([
    prisma.account.findMany({
      where: { status: { in: [...PLAYING] } },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        youtubers: { select: { id: true } },
      },
    }),
    prisma.playGameStat.groupBy({ by: ['accountId'], _sum: { xp: true, played: true } }),
    prisma.playProfile.findMany({ select: { accountId: true, bonusXp: true, bannedAt: true } }),
    prisma.playTrophyWin.groupBy({ by: ['accountId'], _sum: { xp: true } }),
    prisma.youtuber.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
      select: { id: true, name: true, avatarUrl: true },
    }),
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
        youtuberIds: account.youtubers.map((youtuber) => youtuber.id),
      }
    })
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))

  return {
    players,
    youtubers,
    totals: {
      players: players.length,
      active: players.filter((player) => player.played > 0).length,
      banned: players.filter((player) => player.isBanned).length,
      xp: players.reduce((sum, player) => sum + player.xp, 0),
    },
  }
}

/**
 * Portrait of one player, for the head of their file
 * @param {string} accountId - Player
 * @return {Promise<{ accountId: string; name: string; avatarUrl: string | null } | null>} - Player, null when unknown
 */

export const readPlayAdminPlayer = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { id: true, displayName: true, avatarUrl: true },
  })

  return account
    ? { accountId: account.id, name: account.displayName, avatarUrl: account.avatarUrl }
    : null
}

/**
 * Players a bulk gesture reaches: the ones chosen, or everyone
 * @param {unknown} raw - Chosen identifiers, none for everyone
 * @return {Promise<string[]>} - Account identifiers
 */

const targetsOf = async (raw: unknown): Promise<string[]> => {
  const chosen = Array.isArray(raw)
    ? [...new Set(raw.filter((id): id is string => typeof id === 'string'))]
    : []
  if (chosen.length > PLAY_SETTINGS.admin.maxSelection) {
    throw invalidInput([{ field: 'accountIds', message: PLAY_ERRORS.invalidSettings }])
  }

  const accounts = await prisma.account.findMany({
    where: { status: { in: [...PLAYING] }, ...(chosen.length ? { id: { in: chosen } } : {}) },
    select: { id: true },
  })

  return accounts.map(({ id }) => id)
}

/**
 * Give or take XP from some moderators, or all of them, on a game or the global line
 * @param {AdminActor} actor - Admin acting
 * @param {Record<string, unknown>} raw - Body with game, amount and the chosen accounts
 * @return {Promise<number>} - Moderators touched
 */

export const adjustEveryonesXp = async (
  actor: AdminActor,
  raw: Record<string, unknown>
): Promise<number> => {
  // Only the admin level reaches several players
  if (!actor.isAdmin) throw forbidden()

  const game = targetOf(raw)
  const limit = PLAY_SETTINGS.admin.maxXpChange
  const amount = integerOf(raw, 'amount', { min: -limit, max: limit })
  const ids = await targetsOf(raw.accountIds)

  for (let at = 0; at < ids.length; at += BATCH) {
    await Promise.all(
      ids
        .slice(at, at + BATCH)
        .map((id) =>
          game
            ? writeXp(id, game, (current) => current + amount)
            : writeBonus(id, (bonus) => bonus + amount)
        )
    )
  }
  await journalPlay(
    ...ids.map((id) => ({
      eventType: 'PlayAdjusted' as const,
      subjectId: id,
      actorId: actor.id,
      game: game ?? undefined,
      template: amount >= 0 ? PLAY_JOURNAL.xpAdded : PLAY_JOURNAL.xpRemoved,
      values: { amount: Math.abs(amount) },
    }))
  )

  return ids.length
}

/**
 * Wipe the progression of some moderators: a game, the global bonus, or everything
 * @param {AdminActor} actor - Admin acting
 * @param {Record<string, unknown>} raw - Body with game and the chosen accounts
 * @return {Promise<number>} - Moderators touched
 */

export const resetSelectedPlay = async (
  actor: AdminActor,
  raw: Record<string, unknown>
): Promise<number> => {
  if (!actor.isAdmin) throw forbidden()
  const ids = await targetsOf(raw.accountIds)
  // Wiping needs a named selection, never everyone by omission
  if (!Array.isArray(raw.accountIds) || raw.accountIds.length === 0) {
    throw invalidInput([{ field: 'accountIds', message: PLAY_ERRORS.invalidSettings }])
  }

  const isAll = raw.game === PLAY_ADMIN_TARGETS.all
  const game = isAll ? null : targetOf(raw)
  await prisma.$transaction([
    ...(isAll || game
      ? [
          prisma.playGameStat.deleteMany({
            where: { accountId: { in: ids }, ...(game ? { game } : {}) },
          }),
        ]
      : []),
    ...(isAll || !game
      ? [prisma.playProfile.updateMany({ where: { accountId: { in: ids } }, data: { bonusXp: 0 } })]
      : []),
  ])
  await journalPlay(
    ...ids.map((id) => ({
      eventType: 'PlayAdjusted' as const,
      subjectId: id,
      actorId: actor.id,
      game: game ?? undefined,
      template: isAll ? PLAY_JOURNAL.wiped : PLAY_JOURNAL.reset,
    }))
  )

  return ids.length
}
