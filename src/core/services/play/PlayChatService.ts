import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, invalidInput } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { signalChat } from '@/core/lib/play/signal'
import { loadSession } from '@/core/services/play/PlaySessionService'
import { fillPlayMessage, PLAY_ERRORS } from '@/declarations/play'
import { PLAY_CHAT } from '@/declarations/play/chat'
import type { PlayMessageView } from '@/types/play'
import { PlayMessageKinds, PlayStatuses } from '@/utils/constants/play'
import type { PlayMessageKindName } from '@/utils/constants/play'

// Author shown on a line
const MESSAGE_INCLUDE = {
  account: { select: { id: true, displayName: true, avatarUrl: true } },
} satisfies Prisma.PlayMessageInclude

/**
 * Line as the chat draws it
 * @param {Prisma.PlayMessageGetPayload<{ include: typeof MESSAGE_INCLUDE }>} row - Stored line
 * @return {PlayMessageView} - Line
 */

const toMessageView = (
  row: Prisma.PlayMessageGetPayload<{ include: typeof MESSAGE_INCLUDE }>
): PlayMessageView => ({
  id: row.id,
  kind: row.kind,
  body: row.body,
  createdAt: row.createdAt.toISOString(),
  author: { id: row.account.id, name: row.account.displayName, avatarUrl: row.account.avatarUrl },
})

/**
 * Last lines of a game chat, oldest first
 * @param {string} sessionId - Game
 * @return {Promise<object[]>} - Messages
 */

export const listMessages = async (sessionId: string) => {
  const rows = await prisma.playMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: PLAY_CHAT.history,
    include: MESSAGE_INCLUDE,
  })

  return rows.reverse().map(toMessageView)
}

/**
 * Write a plain line in a game chat
 * @param {string} sessionId - Game
 * @param {string} accountId - Writer
 * @param {Record<string, unknown>} raw - Body with text
 * @return {Promise<PlayMessageView>} - Line sent
 */

export const postMessage = async (
  sessionId: string,
  accountId: string,
  raw: Record<string, unknown>
): Promise<PlayMessageView> => {
  const body = readBodyText(raw, 'body', PLAY_ERRORS.emptyMessage)
  if (body.length > PLAY_CHAT.maxLength) {
    const message = fillPlayMessage(PLAY_ERRORS.longMessage, { max: PLAY_CHAT.maxLength })
    throw invalidInput([{ field: 'body', message }], message)
  }
  const session = await loadSession(sessionId)
  if (session.status === PlayStatuses.Abandoned) throw conflict(PLAY_ERRORS.sessionClosed)

  const row = await prisma.playMessage.create({
    data: { sessionId, accountId, body },
    include: MESSAGE_INCLUDE,
  })
  const message = toMessageView(row)
  // The line itself travels, no page read
  await signalChat(sessionId, message)

  return message
}

/**
 * Table event written in the chat
 * @param {string} sessionId - Game
 * @param {string} accountId - Player concerned
 * @param {PlayMessageKindName} kind - Event
 * @return {Promise<void>} - Posted
 */

export const announceInChat = async (
  sessionId: string,
  accountId: string,
  kind: Exclude<PlayMessageKindName, typeof PlayMessageKinds.Text>
): Promise<void> => {
  await prisma.playMessage.create({ data: { sessionId, accountId, kind, body: '' } })
}
