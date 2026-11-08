import 'server-only'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput } from '@/core/lib/errors'
import { publishLive } from '@/core/lib/lives/bus'
import { cleanMentions } from '@/core/lib/lives/teamChat'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { TEAM_CHAT_EVENTS } from '@/declarations/lives/teamChat'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { SessionUser } from '@/types/auth'
import type { LiveTeamMessage, LiveTeamPage } from '@/types/lives'
import { LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

// Columns read back
const MESSAGE_SELECT = {
  id: true,
  authorId: true,
  body: true,
  mentions: true,
  createdAt: true,
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
 * Message shaped for the browser
 * @param {object} row - Stored message
 * @return {LiveTeamMessage} - Message
 */

const toMessage = (row: {
  id: string
  authorId: string
  body: string
  mentions: string[]
  createdAt: Date
}): LiveTeamMessage => ({
  id: row.id,
  authorId: row.authorId,
  body: decryptField(row.body) ?? '',
  mentions: cleanMentions(row.mentions),
  createdAt: row.createdAt.toISOString(),
})

/**
 * Page of the chat of a live
 * @param {string} liveId - Live
 * @param {SessionUser} session - Reader
 * @param {string | null} cursor - Oldest message of the previous page
 * @return {Promise<LiveTeamPage>} - Page, oldest first
 */

export const listTeamMessages = async (
  liveId: string,
  session: SessionUser,
  cursor: string | null
): Promise<LiveTeamPage> => {
  if (!(await canUseTeamChat(liveId, session))) throw forbidden()
  const size = LIVE_SETTINGS.teamChatPageSize

  const rows = await prisma.liveTeamMessage.findMany({
    where: { liveId },
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
 * @return {Promise<LiveTeamMessage>} - Stored message
 */

export const sendTeamMessage = async (input: {
  liveId: string
  session: SessionUser
  body: unknown
  mentions: unknown
}): Promise<LiveTeamMessage> => {
  const { liveId, session } = input
  if (!(await canUseTeamChat(liveId, session))) throw forbidden()

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
      mentions: cleanMentions(input.mentions),
    },
    select: MESSAGE_SELECT,
  })
  const message = toMessage(row)
  await publishLive(LIVE_TOPICS.team(liveId), { type: TEAM_CHAT_EVENTS.message, message })

  return message
}
