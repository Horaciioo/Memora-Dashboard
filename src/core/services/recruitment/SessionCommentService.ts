import 'server-only'

import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { COMMENT_SHAPE, toComment } from '@/core/services/academy/juniors/CommentService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { reachableSession } from '@/core/services/recruitment/RecruitmentService'
import type { CommentView } from '@/types/comments'
import type { FormValues } from '@/types/forms'

/**
 * Read the remarks of a session, newest last
 * @param {string} sessionId - Session identifier
 * @return {Promise<CommentView[]>} - Remarks
 */

const readComments = async (sessionId: string): Promise<CommentView[]> => {
  const rows = await prisma.recruitmentComment.findMany({
    where: { sessionId },
    include: COMMENT_SHAPE,
    orderBy: { createdAt: 'asc' },
  })

  return rows.map(toComment)
}

/**
 * Remarks of a session after a write
 * @typedef {Object} SessionCommentResult
 * @property {CommentView[]} comments - Remarks of the session
 * @property {string} subject - Name of the session
 */

export interface SessionCommentResult {
  comments: CommentView[]
  subject: string
}

/**
 * Leave a remark on a session
 * @param {string} sessionId - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {string} authorId - Who writes it
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<SessionCommentResult>} - Remarks
 */

export const addSessionComment = async (
  sessionId: string,
  values: FormValues,
  authorId: string,
  scope: AccessScope
): Promise<SessionCommentResult> => {
  const session = await reachableSession(sessionId, scope)

  await prisma.recruitmentComment.create({
    data: { sessionId, authorId, body: encryptField(readText(values, 'body')) ?? '' },
  })

  return { comments: await readComments(sessionId), subject: session.name }
}

/**
 * Drop a remark left on a session
 * @param {string} id - Comment identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CommentView[]>} - Remarks left
 */

export const removeSessionComment = async (
  id: string,
  scope: AccessScope
): Promise<CommentView[]> => {
  const row = await prisma.recruitmentComment.findUnique({
    where: { id },
    select: { sessionId: true },
  })
  if (!row?.sessionId) throw notFound()

  // A remark follows the reach of its session
  await reachableSession(row.sessionId, scope)
  await prisma.recruitmentComment.delete({ where: { id } })

  return readComments(row.sessionId)
}
