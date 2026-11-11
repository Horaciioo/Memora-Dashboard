import 'server-only'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput } from '@/core/lib/errors'
import { publishLive } from '@/core/lib/lives/bus'
import { cleanMentions, cleanScope, groupReactions } from '@/core/lib/lives/teamChat'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { TEAM_CHAT_EMOJI_MAX, TEAM_CHAT_EVENTS } from '@/declarations/lives/teamChat'
import type { TeamChatScope } from '@/declarations/lives/teamChat'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { SessionUser } from '@/types/auth'
import type { LiveTeamMessage, LiveTeamPage } from '@/types/lives'
import { AcademyJuniorStatuses, LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

// Columns read back
const MESSAGE_SELECT = {
  id: true,
  authorId: true,
  body: true,
  mentions: true,
  scope: true,
  createdAt: true,
  reactions: { select: { emoji: true, accountId: true }, orderBy: { createdAt: 'asc' } },
} as const

/**
 * Whether a member may use the chat of a live
 * @param {string} liveId - Live
 * @param {SessionUser} session - Member
 * @return {Promise<boolean>} - Convened, coordinating, or leading
 */

export const canUseTeamChat = async (liveId: string, session: SessionUser): Promise<boolean> => {
  if (!resolvePermissions(session).can(Permissions.LiveRead)) return false
  if (LEADERSHIP_ROLES.includes(session.role)) return true

  const [seat, coordination] = await Promise.all([
    prisma.liveMember.count({ where: { liveId, accountId: session.id } }),
    prisma.liveCoordination.count({ where: { liveId, accountId: session.id } }),
  ])

  return seat + coordination > 0
}

/**
 * Whether a member may read the referents room of a live
 * @param {string} liveId - Live
 * @param {SessionUser} session - Member
 * @return {Promise<boolean>} - Referent, responsable or above, in the chat
 */

export const canUseReferentsRoom = async (
  liveId: string,
  session: SessionUser
): Promise<boolean> => {
  if (!(await canUseTeamChat(liveId, session))) return false
  if (LEADERSHIP_ROLES.includes(session.role)) return true

  const referred = await prisma.academyJunior.count({
    where: { referentId: session.id, status: AcademyJuniorStatuses.Active },
  })

  return referred > 0
}

// Topic of a room
const topicOf = (liveId: string, scope: TeamChatScope): string =>
  scope === 'all' ? LIVE_TOPICS.team(liveId) : LIVE_TOPICS.privateRoom(liveId, scope)

/**
 * Whether a member may use one room of a live
 * @param {string} liveId - Live
 * @param {SessionUser} session - Member
 * @param {TeamChatScope} scope - Room
 * @return {Promise<boolean>} - Room open to them
 */

export const canUseScope = async (
  liveId: string,
  session: SessionUser,
  scope: TeamChatScope
): Promise<boolean> => {
  if (scope === 'referents') return canUseReferentsRoom(liveId, session)
  if (!(await canUseTeamChat(liveId, session))) return false

  return scope === 'all' || LEADERSHIP_ROLES.includes(session.role)
}

// Room opened to the member, or refused
const guardScope = async (
  liveId: string,
  session: SessionUser,
  scope: TeamChatScope
): Promise<void> => {
  if (!(await canUseScope(liveId, session, scope))) throw forbidden()
}

/**
 * Message shaped for the browser
 * @param {object} row - Stored message
 * @return {LiveTeamMessage} - Message
 */

const toMessage = (row: {
  id: string
  authorId: string
  body: string
  mentions: string[]
  scope: string
  createdAt: Date
  reactions: { emoji: string; accountId: string }[]
}): LiveTeamMessage => ({
  id: row.id,
  authorId: row.authorId,
  body: decryptField(row.body) ?? '',
  mentions: cleanMentions(row.mentions, cleanScope(row.scope)),
  scope: cleanScope(row.scope),
  reactions: groupReactions(row.reactions),
  createdAt: row.createdAt.toISOString(),
})

/**
 * Page of the chat of a live
 * @param {string} liveId - Live
 * @param {SessionUser} session - Reader
 * @param {string | null} cursor - Oldest message of the previous page
 * @param {unknown} [scope] - Room read, all by default
 * @return {Promise<LiveTeamPage>} - Page, oldest first
 */

export const listTeamMessages = async (
  liveId: string,
  session: SessionUser,
  cursor: string | null,
  scope: unknown = 'all'
): Promise<LiveTeamPage> => {
  const room = cleanScope(scope)
  await guardScope(liveId, session, room)
  const size = LIVE_SETTINGS.teamChatPageSize

  const rows = await prisma.liveTeamMessage.findMany({
    where: { liveId, scope: room },
    select: MESSAGE_SELECT,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    // One more row tells whether a page follows
    take: size + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })
  const page = rows.slice(0, size)

  return {
    messages: page.map(toMessage).reverse(),
    nextCursor: rows.length > size ? (page.at(-1)?.id ?? null) : null,
  }
}

/**
 * Write a message and hand it to the team
 * @param {Object} input - Message
 * @param {string} input.liveId - Live
 * @param {SessionUser} input.session - Author
 * @param {unknown} input.body - Text
 * @param {unknown} input.mentions - Kinds called
 * @param {unknown} [input.scope] - Room written in
 * @return {Promise<LiveTeamMessage>} - Stored message
 */

export const sendTeamMessage = async (input: {
  liveId: string
  session: SessionUser
  body: unknown
  mentions: unknown
  scope?: unknown
}): Promise<LiveTeamMessage> => {
  const { liveId, session } = input
  const scope = cleanScope(input.scope)
  await guardScope(liveId, session, scope)

  // Text bounded
  const body = typeof input.body === 'string' ? input.body.trim() : ''
  if (!body || body.length > LIVE_SETTINGS.teamChatMaxLength) {
    throw invalidInput([{ field: 'body', message: FORM_COPY.required }])
  }

  // Store then broadcast
  const row = await prisma.liveTeamMessage.create({
    data: {
      liveId,
      authorId: session.id,
      body: encryptField(body) ?? '',
      mentions: cleanMentions(input.mentions, scope),
      scope,
    },
    select: MESSAGE_SELECT,
  })
  const message = toMessage(row)
  await publishLive(topicOf(liveId, scope), { type: TEAM_CHAT_EVENTS.message, message })

  return message
}

/**
 * Tell a room that a member is writing
 * @param {Object} input - Signal
 * @param {string} input.liveId - Live
 * @param {SessionUser} input.session - Writer
 * @param {unknown} input.scope - Room
 * @return {Promise<void>} - Sent
 */

export const signalTyping = async (input: {
  liveId: string
  session: SessionUser
  scope: unknown
}): Promise<void> => {
  const scope = cleanScope(input.scope)
  await guardScope(input.liveId, input.session, scope)
  await publishLive(topicOf(input.liveId, scope), {
    type: TEAM_CHAT_EVENTS.typing,
    authorId: input.session.id,
  })
}

/**
 * Add or take back an emoji on a message
 * @param {Object} input - Reaction
 * @param {string} input.liveId - Live
 * @param {SessionUser} input.session - Member
 * @param {unknown} input.messageId - Message
 * @param {unknown} input.emoji - Emoji
 * @return {Promise<void>} - Done
 */

export const toggleReaction = async (input: {
  liveId: string
  session: SessionUser
  messageId: unknown
  emoji: unknown
}): Promise<void> => {
  const { liveId, session } = input
  const emoji = typeof input.emoji === 'string' ? input.emoji.trim() : ''
  if (typeof input.messageId !== 'string' || !emoji || emoji.length > TEAM_CHAT_EMOJI_MAX) {
    throw invalidInput([{ field: 'emoji', message: FORM_COPY.required }])
  }

  const message = await prisma.liveTeamMessage.findFirst({
    where: { id: input.messageId, liveId },
    select: { id: true, scope: true },
  })
  if (!message) throw forbidden()
  const scope = cleanScope(message.scope)
  await guardScope(liveId, session, scope)

  // One row per member and emoji
  const key = { messageId_accountId_emoji: { messageId: message.id, accountId: session.id, emoji } }
  const existing = await prisma.liveTeamReaction.findUnique({ where: key, select: { id: true } })
  if (existing) await prisma.liveTeamReaction.delete({ where: key })
  else
    await prisma.liveTeamReaction.create({
      data: { messageId: message.id, accountId: session.id, emoji },
    })

  const rows = await prisma.liveTeamReaction.findMany({
    where: { messageId: message.id },
    select: { emoji: true, accountId: true },
    orderBy: { createdAt: 'asc' },
  })
  await publishLive(topicOf(liveId, scope), {
    type: TEAM_CHAT_EVENTS.reactions,
    messageId: message.id,
    reactions: groupReactions(rows),
  })
}
