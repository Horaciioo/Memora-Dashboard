import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { seatBoundsOf } from '@/core/lib/play/seats'
import { conflict } from '@/core/lib/errors'
import { pickSeatColor } from '@/core/lib/play'
import { isPresent } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { signalPlay } from '@/core/lib/play/signal'
import { botLevelsOf, PLAY_BOT_AVATARS, PLAY_BOT_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import { announceInChat } from '@/core/services/play/PlayChatService'
import { lockSession, requireHost } from '@/core/services/play/PlaySessionService'
import { PlayMessageKinds, PlayStatuses } from '@/utils/constants/play'
import type { PlayBotKindName } from '@/utils/constants/play'

/**
 * Bot account of a level and callsign, made once
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {PlayBotKindName} level - Level
 * @param {number} index - Callsign index
 * @return {Promise<string>} - Bot id
 */

const findOrCreateBot = async (
  tx: Prisma.TransactionClient,
  level: PlayBotKindName,
  index: number
): Promise<string> => {
  const discordId = `play-bot:${level}:${index}`
  const face = {
    displayName: PLAY_BOT_SETTINGS.callsigns[index],
    avatarUrl: PLAY_BOT_AVATARS[level],
  }
  const bot = await tx.account.upsert({
    where: { discordId },
    create: { discordId, botKind: level, ...face },
    update: face,
    select: { id: true },
  })

  return bot.id
}

/**
 * Level asked, one allowed for the game
 * @param {LoadedSession} session - Game
 * @param {unknown} level - Asked level
 * @return {PlayBotKindName} - Level
 */

const readBotLevel = (session: LoadedSession, level: unknown): PlayBotKindName => {
  const levels = botLevelsOf(session.game)
  // A single level needs no choice
  if (levels.length === 1) return levels[0]
  if (!levels.includes(level as PlayBotKindName)) throw conflict(PLAY_ERRORS.botLevel)

  return level as PlayBotKindName
}

/**
 * Seat bots in the free places
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession} session - Lobby
 * @param {Object} ask - Seats wanted
 * @param {PlayBotKindName} ask.level - Level
 * @param {number} ask.count - Bots wanted
 * @return {Promise<string[]>} - Bots seated
 */

const seatBots = async (
  tx: Prisma.TransactionClient,
  session: LoadedSession,
  { level, count }: { level: PlayBotKindName; count: number }
): Promise<string[]> => {
  const present = session.seats.filter(isPresent)
  const names = new Set(present.map((seat) => seat.account.displayName))
  const colors = present.map((seat) => seat.color)
  const free = Math.min(count, seatBoundsOf(session.game, session.settings).max - present.length)
  if (free <= 0) throw conflict(PLAY_ERRORS.full)

  // Callsigns not yet at the table
  const indexes = PLAY_BOT_SETTINGS.callsigns
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => !names.has(name))
    .slice(0, free)
  const seated: string[] = []
  for (const { index } of indexes) {
    const accountId = await findOrCreateBot(tx, level, index)
    const color = pickSeatColor(colors)
    colors.push(color)
    await tx.playSeat.upsert({
      where: { sessionId_accountId: { sessionId: session.id, accountId } },
      create: { sessionId: session.id, accountId, color },
      update: { leftAt: null, kickedAt: null, color, joinedAt: new Date() },
    })
    seated.push(accountId)
  }

  return seated
}

/**
 * Host seats bots in a lobby
 * @param {string} sessionId - Game
 * @param {string} hostId - Host
 * @param {Object} ask - Seats wanted
 * @param {unknown} ask.level - Asked level
 * @param {boolean} [ask.fill] - Every free seat
 * @return {Promise<void>} - Seated
 */

export const addBots = async (
  sessionId: string,
  hostId: string,
  { level, fill = false }: { level: unknown; fill?: boolean }
): Promise<void> => {
  const seated = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    requireHost(session, hostId)
    if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)

    return seatBots(tx, session, {
      level: readBotLevel(session, level),
      count: fill ? seatBoundsOf(session.game, session.settings).max : 1,
    })
  })

  for (const botId of seated) await announceInChat(sessionId, botId, PlayMessageKinds.Joined)
  await signalPlay(sessionId, true)
}
