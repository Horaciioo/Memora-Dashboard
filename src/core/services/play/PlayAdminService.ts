import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { readBodyInteger, readBodyText, xpForLevel } from '@/core/lib/play'
import { loadTarget } from '@/core/services/members/admin'
import type { AdminActor } from '@/core/services/members/admin'
import { leaveSession } from '@/core/services/play/LobbyService'
import { journalPlay } from '@/core/services/play/PlayJournalService'
import { currentSessionId } from '@/core/services/play/PlaySessionService'
import { readPlayPresence, readPlayProfile } from '@/core/services/play/ProfileService'
import { PLAY_ERRORS, PLAY_GAMES, PLAY_JOURNAL, PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_ADMIN_TARGETS } from '@/declarations/play/admin'
import type { PlayAdminState } from '@/types/play'
import type { Prisma } from '@prisma/client'
import type { PlayGameName } from '@/utils/constants/play'

// Counters a lead may correct
const STAT_FIELDS = ['wins', 'draws', 'losses', 'streak'] as const

/**
 * Game named in a body
 * @param {Record<string, unknown>} raw - Body
 * @return {PlayGameName} - Game
 */

const gameOf = (raw: Record<string, unknown>): PlayGameName => {
  const game = readBodyText(raw, 'game', PLAY_ERRORS.unknownGame)
  if (!PLAY_GAMES.has(game))
    throw invalidInput([{ field: 'game', message: PLAY_ERRORS.unknownGame }])

  return game
}

/**
 * Game or global line named in a body
 * @param {Record<string, unknown>} raw - Body
 * @return {PlayGameName | null} - Game, null for the global line
 */

const targetOf = (raw: Record<string, unknown>): PlayGameName | null =>
  raw.game === PLAY_ADMIN_TARGETS.global ? null : gameOf(raw)

/**
 * Bounded integer of a body
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field
 * @param {{ min: number, max: number }} range - Bounds
 * @return {number} - Value
 */

const integerOf = (
  raw: Record<string, unknown>,
  field: string,
  range: { min: number; max: number }
): number => {
  const value = readBodyInteger(raw, field) ?? Number(raw[field])
  if (!Number.isInteger(value) || value < range.min || value > range.max) {
    throw invalidInput([{ field, message: PLAY_ERRORS.invalidSettings }])
  }

  return value
}

/**
 * Play state of a member, for the Admin tab
 * @param {string} accountId - Member
 * @return {Promise<PlayAdminState>} - Profile and current game
 */

export const readPlayAdmin = async (accountId: string): Promise<PlayAdminState> => {
  const [profile, presence] = await Promise.all([
    readPlayProfile(accountId),
    readPlayPresence(accountId),
  ])

  return { ...profile, presence }
}

/**
 * Write a game's XP to a fixed value
 * @param {string} accountId - Member
 * @param {PlayGameName} game - Game
 * @param {(current: number) => number} next - New XP from the current one
 * @return {Promise<number>} - XP before
 */

const writeXp = async (
  accountId: string,
  game: PlayGameName,
  next: (current: number) => number
): Promise<number> =>
  prisma.$transaction(async (tx) => {
    const stat = await tx.playGameStat.findUnique({
      where: { accountId_game: { accountId, game } },
    })
    const before = stat?.xp ?? 0
    const xp = Math.max(0, next(before))
    await tx.playGameStat.upsert({
      where: { accountId_game: { accountId, game } },
      create: { accountId, game, xp },
      update: { xp },
    })

    return before
  })

/**
 * Sum of a member's game XP
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string} accountId - Member
 * @return {Promise<number>} - XP
 */

const gamesXp = async (tx: Prisma.TransactionClient, accountId: string): Promise<number> =>
  (await tx.playGameStat.aggregate({ where: { accountId }, _sum: { xp: true } }))._sum.xp ?? 0

/**
 * Write the global bonus, the global XP never below zero
 * @param {string} accountId - Member
 * @param {(bonus: number, games: number) => number} next - New bonus
 * @return {Promise<void>} - Written
 */

const writeBonus = async (
  accountId: string,
  next: (bonus: number, games: number) => number
): Promise<void> =>
  prisma.$transaction(async (tx) => {
    const [profile, games] = await Promise.all([
      tx.playProfile.findUnique({ where: { accountId } }),
      gamesXp(tx, accountId),
    ])
    const bonusXp = Math.max(-games, next(profile?.bonusXp ?? 0, games))
    await tx.playProfile.upsert({
      where: { accountId },
      create: { accountId, bonusXp },
      update: { bonusXp },
    })
  })

/**
 * Give or take XP on a game or on the global line
 * @param {AdminActor} actor - Lead acting
 * @param {string} accountId - Member
 * @param {Record<string, unknown>} raw - Body with game and amount
 * @return {Promise<object>} - Play state afterwards
 */

export const adjustPlayXp = async (
  actor: AdminActor,
  accountId: string,
  raw: Record<string, unknown>
) => {
  await loadTarget(accountId, actor)
  const game = targetOf(raw)
  const limit = PLAY_SETTINGS.admin.maxXpChange
  const amount = integerOf(raw, 'amount', { min: -limit, max: limit })

  // A game's XP also lifts the global line
  if (game) await writeXp(accountId, game, (current) => current + amount)
  else await writeBonus(accountId, (bonus) => bonus + amount)
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    game: game ?? undefined,
    template: amount >= 0 ? PLAY_JOURNAL.xpAdded : PLAY_JOURNAL.xpRemoved,
    values: { amount: Math.abs(amount) },
  })

  return readPlayAdmin(accountId)
}

/**
 * Put a member at a level on a game
 * @param {AdminActor} actor - Lead acting
 * @param {string} accountId - Member
 * @param {Record<string, unknown>} raw - Body with game and level
 * @return {Promise<object>} - Play state afterwards
 */

export const setPlayLevel = async (
  actor: AdminActor,
  accountId: string,
  raw: Record<string, unknown>
) => {
  await loadTarget(accountId, actor)
  const game = targetOf(raw)
  const level = integerOf(raw, 'level', { min: 1, max: PLAY_SETTINGS.levels.max })

  if (game) await writeXp(accountId, game, () => xpForLevel(level))
  else await writeBonus(accountId, (_, games) => xpForLevel(level) - games)
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    game: game ?? undefined,
    template: PLAY_JOURNAL.levelSet,
    values: { level },
  })

  return readPlayAdmin(accountId)
}

/**
 * Wipe a game, the global bonus, or everything
 * @param {AdminActor} actor - Lead acting
 * @param {string} accountId - Member
 * @param {Record<string, unknown>} raw - Body with game
 * @return {Promise<object>} - Play state afterwards
 */

export const resetPlayGame = async (
  actor: AdminActor,
  accountId: string,
  raw: Record<string, unknown>
) => {
  await loadTarget(accountId, actor)
  if (raw.game === PLAY_ADMIN_TARGETS.all) {
    await prisma.$transaction([
      prisma.playGameStat.deleteMany({ where: { accountId } }),
      prisma.playProfile.updateMany({ where: { accountId }, data: { bonusXp: 0 } }),
    ])
    await journalPlay({
      eventType: 'PlayAdjusted',
      subjectId: accountId,
      actorId: actor.id,
      template: PLAY_JOURNAL.wiped,
    })

    return readPlayAdmin(accountId)
  }

  const game = targetOf(raw)
  if (game) await prisma.playGameStat.deleteMany({ where: { accountId, game } })
  else await prisma.playProfile.updateMany({ where: { accountId }, data: { bonusXp: 0 } })
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    game: game ?? undefined,
    template: PLAY_JOURNAL.reset,
  })

  return readPlayAdmin(accountId)
}

/**
 * Take a member out of their game
 * @param {AdminActor} actor - Lead acting
 * @param {string} accountId - Member
 * @return {Promise<object>} - Play state afterwards
 */

export const removeFromPlay = async (actor: AdminActor, accountId: string) => {
  await loadTarget(accountId, actor)
  const sessionId = await currentSessionId(accountId)
  if (!sessionId) throw notFound(PLAY_ERRORS.notSeated)

  const session = await prisma.playSession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { game: true },
  })
  await leaveSession(sessionId, accountId)
  await journalPlay({
    eventType: 'PlayKicked',
    subjectId: accountId,
    actorId: actor.id,
    game: session.game,
    template: PLAY_JOURNAL.removed,
    sessionId,
  })

  return readPlayAdmin(accountId)
}

/**
 * Correct the record of a game
 * @param {AdminActor} actor - Lead acting
 * @param {string} accountId - Member
 * @param {Record<string, unknown>} raw - Body with game and counters
 * @return {Promise<object>} - Play state afterwards
 */

export const correctPlayStats = async (
  actor: AdminActor,
  accountId: string,
  raw: Record<string, unknown>
) => {
  await loadTarget(accountId, actor)
  const game = gameOf(raw)
  const range = { min: 0, max: PLAY_SETTINGS.admin.maxCounter }
  const [wins, draws, losses, streak] = STAT_FIELDS.map((field) => integerOf(raw, field, range))

  await prisma.$transaction(async (tx) => {
    const stat = await tx.playGameStat.findUnique({
      where: { accountId_game: { accountId, game } },
    })
    const record = {
      wins,
      draws,
      losses,
      streak,
      played: wins + draws + losses + (stat?.abandons ?? 0),
      bestStreak: Math.max(streak, stat?.bestStreak ?? 0),
    }
    await tx.playGameStat.upsert({
      where: { accountId_game: { accountId, game } },
      create: { accountId, game, ...record },
      update: record,
    })
  })
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    game,
    template: PLAY_JOURNAL.statsSet,
    values: { wins, draws, losses },
  })

  return readPlayAdmin(accountId)
}

/**
 * Keep a member out of Play, or let them back
 * @param {AdminActor} actor - Lead acting
 * @param {string} accountId - Member
 * @param {Record<string, unknown> | null} raw - Body with the reason, null to lift
 * @return {Promise<object>} - Play state afterwards
 */

export const setPlayBan = async (
  actor: AdminActor,
  accountId: string,
  raw: Record<string, unknown> | null
) => {
  await loadTarget(accountId, actor)
  const reason = raw ? readBodyText(raw, 'reason', PLAY_ERRORS.banReason) : null
  const ban = { bannedAt: reason ? new Date() : null, banReason: reason }

  await prisma.playProfile.upsert({
    where: { accountId },
    create: { accountId, ...ban },
    update: ban,
  })
  // A banned player leaves the table
  const sessionId = reason ? await currentSessionId(accountId) : null
  if (sessionId) await leaveSession(sessionId, accountId)
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    template: reason ? PLAY_JOURNAL.banned : PLAY_JOURNAL.unbanned,
    values: reason ? { reason } : {},
    sessionId: sessionId ?? undefined,
  })

  return readPlayAdmin(accountId)
}
