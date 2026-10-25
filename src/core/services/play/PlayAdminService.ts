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
import type { PlayAdminState } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

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
 * Give or take XP on a game
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
  const game = gameOf(raw)
  const limit = PLAY_SETTINGS.admin.maxXpChange
  const amount = integerOf(raw, 'amount', { min: -limit, max: limit })

  await writeXp(accountId, game, (current) => current + amount)
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    game,
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
  const game = gameOf(raw)
  const level = integerOf(raw, 'level', { min: 1, max: PLAY_SETTINGS.levels.max })

  await writeXp(accountId, game, () => xpForLevel(level))
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    game,
    template: PLAY_JOURNAL.levelSet,
    values: { level },
  })

  return readPlayAdmin(accountId)
}

/**
 * Wipe a member's progression on a game
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
  const game = gameOf(raw)

  await prisma.playGameStat.deleteMany({ where: { accountId, game } })
  await journalPlay({
    eventType: 'PlayAdjusted',
    subjectId: accountId,
    actorId: actor.id,
    game,
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
  await leaveSession(sessionId, accountId, { quiet: true })
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
