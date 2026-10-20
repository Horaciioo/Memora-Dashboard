import 'server-only'

import { decryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { commentMention } from '@/core/services/work/WorkCommentService'
import { notify } from '@/core/services/system/NotificationService'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { juniorTargetId } from '@/declarations/notifications/targets'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import { WORK_COMMENT_KIND_NAMES, WORK_COMMENT_KINDS } from '@/declarations/work/comments'
import { NOTIFICATION_KINDS } from '@/utils/constants/notifications'
import { readMentions } from '@/utils/format/mentions'

/**
 * Remark that may have named a member
 * @typedef {Object} MentioningComment
 * @property {string} body - Written text
 * @property {string | null} authorId - Who wrote it
 * @property {Date} createdAt - Moment it was written
 * @property {NotificationTargetName} target - Kind of record it sits on
 * @property {string} targetId - Record identifier
 * @property {string} subject - Title of that record
 */

interface MentioningComment {
  body: string
  authorId: string | null
  createdAt: Date
  target: NotificationTargetName
  targetId: string
  subject: string
}

/**
 * Find a remark among the three tables that hold them
 * @param {string} id - Comment identifier
 * @return {Promise<MentioningComment | null>} - Remark and where it sits
 */

const locateComment = async (id: string): Promise<MentioningComment | null> => {
  // Work records
  const work = await prisma.workComment.findUnique({ where: { id } })
  if (work) {
    const kind = WORK_COMMENT_KIND_NAMES.find((name) => work[WORK_COMMENT_KINDS[name].column])
    const record =
      kind && (await commentMention(kind, String(work[WORK_COMMENT_KINDS[kind].column])))

    return record
      ? { ...record, body: work.body, authorId: work.authorId, createdAt: work.createdAt }
      : null
  }

  // Recruitment sessions and applications
  const hiring = await prisma.recruitmentComment.findUnique({
    where: { id },
    include: { session: true, candidate: { include: { session: true } } },
  })
  if (hiring) {
    const session = hiring.session ?? hiring.candidate?.session
    if (!session) return null

    return {
      target: 'recruitment',
      targetId: session.id,
      subject: session.name,
      body: hiring.body,
      authorId: hiring.authorId,
      createdAt: hiring.createdAt,
    }
  }

  // Promotions and juniors
  const academy = await prisma.academyComment.findUnique({
    where: { id },
    include: { junior: { include: { account: true } }, session: true },
  })
  if (!academy) return null

  const sessionId = academy.sessionId ?? academy.junior?.sessionId
  if (!sessionId) return null

  return {
    target: 'junior',
    targetId: academy.junior ? juniorTargetId(sessionId, academy.junior.id) : sessionId,
    subject: academy.junior?.account.displayName ?? '',
    body: academy.body,
    authorId: academy.authorId,
    createdAt: academy.createdAt,
  }
}

/**
 * Put the mention of a remark back among the unread ones
 * @param {string} commentId - Comment identifier
 * @param {string} accountId - Member who was named
 * @return {Promise<void>} - Marked
 */

export const markMentionUnread = async (commentId: string, accountId: string): Promise<void> => {
  const comment = await locateComment(commentId)
  if (!comment) throw notFound()

  // Only the member it names can bring it back
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { displayName: true, discordId: true },
  })
  const { handles, discordIds } = readMentions(
    decryptField(comment.body) ?? '',
    NOTIFICATION_SETTINGS.maxMentions
  )
  const isNamed =
    account &&
    (handles.some((handle) => handle.toLowerCase() === account.displayName.toLowerCase()) ||
      discordIds.includes(account.discordId))
  if (!isNamed) throw notFound()

  // The alert raised right after the remark
  const { count } = await prisma.notification.updateMany({
    where: {
      recipientId: accountId,
      kind: NOTIFICATION_KINDS.ids.Mentioned,
      targetType: comment.target,
      targetId: comment.targetId,
      actorId: comment.authorId,
      createdAt: {
        gte: comment.createdAt,
        lte: new Date(comment.createdAt.getTime() + NOTIFICATION_SETTINGS.mentionMatchMs),
      },
    },
    data: { readAt: null },
  })
  if (count > 0) return

  // Cleared away since, raise it again
  await notify({
    kind: 'Mentioned',
    recipients: [accountId],
    actorId: comment.authorId,
    target: comment.target,
    targetId: comment.targetId,
    subject: comment.subject,
  })
}
