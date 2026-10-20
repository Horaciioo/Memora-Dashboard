import 'server-only'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { sessionNumbers } from '@/core/services/academy/sessionView'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { juniorInScope, sessionInScope } from '@/core/services/academy/lookups'
import type { CommentView } from '@/types/comments'
import type { FormValues } from '@/types/forms'
import { sessionTitle } from '@/utils/format/academy'
import type { Prisma } from '@prisma/client'

// Author name the view reads
export const COMMENT_SHAPE = { author: { select: { displayName: true } } } as const

/**
 * Shape one remark
 * @param {object} row - Comment row with its author
 * @return {CommentView} - Remark view
 */

export const toComment = (row: {
  id: string
  body: string
  createdAt: Date
  author: { displayName: string } | null
}): CommentView => ({
  id: row.id,
  authorName: row.author?.displayName ?? null,
  body: decryptField(row.body) ?? '',
  createdAt: row.createdAt.toISOString(),
})

/**
 * Read the remarks of one target, newest last
 * @param {Prisma.AcademyCommentWhereInput} where - Junior or promotion
 * @return {Promise<CommentView[]>} - Remarks
 */

const readComments = async (where: Prisma.AcademyCommentWhereInput): Promise<CommentView[]> => {
  const rows = await prisma.academyComment.findMany({
    where,
    include: COMMENT_SHAPE,
    orderBy: { createdAt: 'asc' },
  })

  return rows.map(toComment)
}

/**
 * Read the remarks left on a junior
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<CommentView[]>} - Remarks
 */

export const listJuniorComments = async (
  juniorId: string,
  scope: AcademyScope
): Promise<CommentView[]> => {
  await juniorInScope(juniorId, scope)

  return readComments({ juniorId })
}

/**
 * Read the remarks left on a promotion
 * @param {string} sessionId - Promotion identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<CommentView[]>} - Remarks
 */

export const listSessionComments = async (
  sessionId: string,
  scope: AcademyScope
): Promise<CommentView[]> => {
  await sessionInScope(sessionId, scope)

  return readComments({ sessionId, juniorId: null })
}

/**
 * Remarks of a target after a write, and the promotion they belong to
 * @typedef {Object} CommentResult
 * @property {CommentView[]} comments - Remarks of the target
 * @property {string} sessionId - Promotion identifier
 * @property {string} subject - Name of the junior or of the promotion
 */

export interface CommentResult {
  comments: CommentView[]
  sessionId: string
  subject: string
}

/**
 * Leave a remark on a junior
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} authorId - Who writes it
 * @param {FormValues} values - Parsed body
 * @return {Promise<CommentResult>} - Remarks
 */

export const addJuniorComment = async (
  juniorId: string,
  scope: AcademyScope,
  authorId: string,
  values: FormValues
): Promise<CommentResult> => {
  const junior = await juniorInScope(juniorId, scope)

  await prisma.academyComment.create({
    data: { juniorId, authorId, body: encryptField(readText(values, 'body')) ?? '' },
  })

  return {
    comments: await readComments({ juniorId }),
    sessionId: junior.sessionId,
    subject: junior.account.displayName,
  }
}

/**
 * Leave a remark on a promotion
 * @param {string} sessionId - Promotion identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} authorId - Who writes it
 * @param {FormValues} values - Parsed body
 * @return {Promise<CommentResult>} - Remarks
 */

export const addSessionComment = async (
  sessionId: string,
  scope: AcademyScope,
  authorId: string,
  values: FormValues
): Promise<CommentResult> => {
  const session = await sessionInScope(sessionId, scope)

  await prisma.academyComment.create({
    data: { sessionId, authorId, body: encryptField(readText(values, 'body')) ?? '' },
  })

  const number = (await sessionNumbers()).get(sessionId) ?? 1

  return {
    comments: await readComments({ sessionId, juniorId: null }),
    sessionId,
    subject: sessionTitle({ function: session.jobFunction, number }),
  }
}

/**
 * Drop a remark
 * @param {string} id - Comment identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<CommentView[]>} - Remarks left on the same target
 */

export const removeAcademyComment = async (
  id: string,
  scope: AcademyScope
): Promise<CommentView[]> => {
  const row = await prisma.academyComment.findUnique({ where: { id } })
  if (!row) throw notFound()

  // A remark follows the reach of its target
  if (row.juniorId) await juniorInScope(row.juniorId, scope)
  else if (row.sessionId) await sessionInScope(row.sessionId, scope)

  await prisma.academyComment.delete({ where: { id } })

  return readComments(
    row.juniorId ? { juniorId: row.juniorId } : { sessionId: row.sessionId, juniorId: null }
  )
}
