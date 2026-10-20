import 'server-only'

import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { COMMENT_SHAPE, toComment } from '@/core/services/academy/juniors/CommentService'
import {
  assertMeetingVisible,
  assertProjectVisible,
  assertTaskVisible,
} from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import { WORK_COMMENT_KINDS } from '@/declarations/work/comments'
import type { WorkCommentKind } from '@/declarations/work/comments'
import type { PermissionHelpers } from '@/types/auth'
import type { CommentView } from '@/types/comments'
import type { FormValues } from '@/types/forms'

/**
 * Kind named by a route, once the viewer may read it
 * @param {string} kind - Route segment
 * @param {PermissionHelpers} access - Permission helpers
 * @return {WorkCommentKind} - Valid kind
 */

export const commentKind = (kind: string, access: PermissionHelpers): WorkCommentKind => {
  if (!(kind in WORK_COMMENT_KINDS)) throw notFound()
  const known = kind as WorkCommentKind
  if (!access.can(WORK_COMMENT_KINDS[known].permission)) throw forbidden()

  return known
}

/**
 * Refuse a record the viewer cannot reach
 * @param {WorkCommentKind} kind - Record kind
 * @param {string} id - Record identifier
 * @param {WorkViewer} viewer - Who reads
 * @return {Promise<void>} - Throws when hidden
 */

const assertReachable = async (
  kind: WorkCommentKind,
  id: string,
  viewer: WorkViewer
): Promise<void> => {
  if (kind === 'project') return assertProjectVisible(id, viewer)
  if (kind === 'task') return assertTaskVisible(id, viewer)
  if (kind === 'meeting') return assertMeetingVisible(id, viewer)

  // A communication follows its project
  const row = await prisma.communication.findUnique({
    where: { id },
    select: { projectId: true },
  })
  if (!row) throw notFound()
  if (row.projectId) await assertProjectVisible(row.projectId, viewer)
}

/**
 * Read the remarks of one record, newest last
 * @param {WorkCommentKind} kind - Record kind
 * @param {string} id - Record identifier
 * @return {Promise<CommentView[]>} - Remarks
 */

const readComments = async (kind: WorkCommentKind, id: string): Promise<CommentView[]> => {
  const rows = await prisma.workComment.findMany({
    where: { [WORK_COMMENT_KINDS[kind].column]: id },
    include: COMMENT_SHAPE,
    orderBy: { createdAt: 'asc' },
  })

  return rows.map(toComment)
}

/**
 * Read the remarks left on a record
 * @param {WorkCommentKind} kind - Record kind
 * @param {string} id - Record identifier
 * @param {WorkViewer} viewer - Who reads
 * @return {Promise<CommentView[]>} - Remarks
 */

export const listWorkComments = async (
  kind: WorkCommentKind,
  id: string,
  viewer: WorkViewer
): Promise<CommentView[]> => {
  await assertReachable(kind, id, viewer)

  return readComments(kind, id)
}

/**
 * Leave a remark on a record
 * @param {WorkCommentKind} kind - Record kind
 * @param {string} id - Record identifier
 * @param {WorkViewer} viewer - Who writes
 * @param {FormValues} values - Parsed body
 * @return {Promise<CommentView[]>} - Remarks
 */

export const addWorkComment = async (
  kind: WorkCommentKind,
  id: string,
  viewer: WorkViewer,
  values: FormValues
): Promise<CommentView[]> => {
  await assertReachable(kind, id, viewer)

  await prisma.workComment.create({
    data: {
      [WORK_COMMENT_KINDS[kind].column]: id,
      authorId: viewer.id,
      body: encryptField(readText(values, 'body')) ?? '',
    },
  })

  return readComments(kind, id)
}

/**
 * Drop a remark
 * @param {WorkCommentKind} kind - Record kind
 * @param {string} id - Record identifier
 * @param {string} commentId - Remark identifier
 * @param {WorkViewer} viewer - Who drops
 * @return {Promise<CommentView[]>} - Remarks left
 */

export const removeWorkComment = async (
  kind: WorkCommentKind,
  id: string,
  commentId: string,
  viewer: WorkViewer
): Promise<CommentView[]> => {
  await assertReachable(kind, id, viewer)

  // The remark must sit on this record
  const { count } = await prisma.workComment.deleteMany({
    where: { id: commentId, [WORK_COMMENT_KINDS[kind].column]: id },
  })
  if (count === 0) throw notFound()

  return readComments(kind, id)
}
