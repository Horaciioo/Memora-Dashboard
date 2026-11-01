import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { levelAllows } from '@/core/lib/pages'
import type { PageViewer } from '@/core/lib/pages'
import { requirePage } from '@/core/services/pages/AccessService'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_DOCUMENT_COPY } from '@/declarations/pages/copy'
import type { PageCommentView } from '@/types/pages'

const COMMENT_SELECT = {
  id: true,
  pageId: true,
  blockId: true,
  body: true,
  authorId: true,
  resolvedAt: true,
  createdAt: true,
  author: { select: { displayName: true, avatarUrl: true } },
} as const

/**
 * Comment for display
 * @param {Object} row - Comment row
 * @param {string} viewerId - Member reading
 * @return {PageCommentView} - Comment
 */

const toView = (
  row: {
    id: string
    blockId: string | null
    body: string
    authorId: string | null
    resolvedAt: Date | null
    createdAt: Date
    author: { displayName: string; avatarUrl: string | null } | null
  },
  viewerId: string
): PageCommentView => ({
  id: row.id,
  blockId: row.blockId,
  body: row.body,
  authorId: row.authorId,
  authorName: row.author?.displayName ?? '',
  authorImage: row.author?.avatarUrl ?? null,
  resolvedAt: row.resolvedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  isMine: row.authorId === viewerId,
})

/**
 * Comments of a page
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member reading
 * @return {Promise<PageCommentView[]>} - Comments
 */

export const listComments = async (pageId: unknown, viewer: PageViewer): Promise<PageCommentView[]> => {
  const { page } = await requirePage(pageId, viewer, 'read')
  const rows = await prisma.pageComment.findMany({
    where: { pageId: page.id },
    select: COMMENT_SELECT,
    orderBy: { createdAt: 'asc' },
  })

  return rows.map((row) => toView(row, viewer.id))
}

/**
 * Leave a comment
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member commenting
 * @param {Record<string, unknown>} raw - Body and block
 * @return {Promise<PageCommentView>} - Comment
 */

export const addComment = async (
  pageId: unknown,
  viewer: PageViewer,
  raw: Record<string, unknown>
): Promise<PageCommentView> => {
  const { page } = await requirePage(pageId, viewer, 'comment')

  const body = typeof raw.body === 'string' ? raw.body.trim() : ''
  if (!body || body.length > PAGE_SETTINGS.commentMaxLength) {
    throw invalidInput([{ field: 'body', message: PAGE_DOCUMENT_COPY.comment }])
  }

  const row = await prisma.pageComment.create({
    data: {
      pageId: page.id,
      authorId: viewer.id,
      body,
      blockId: typeof raw.blockId === 'string' && raw.blockId ? raw.blockId.slice(0, 64) : null,
    },
    select: COMMENT_SELECT,
  })

  return toView(row, viewer.id)
}

/**
 * Comment the member may change: author or full access
 * @param {string} commentId - Comment id
 * @param {PageViewer} viewer - Member acting
 * @return {Promise<{ id: string, pageId: string }>} - Comment
 */

const requireOwnComment = async (commentId: string, viewer: PageViewer): Promise<{ id: string; pageId: string }> => {
  const comment = await prisma.pageComment.findUnique({
    where: { id: commentId },
    select: { id: true, pageId: true, authorId: true },
  })
  if (!comment) throw notFound()

  const { level } = await requirePage(comment.pageId, viewer, 'comment')
  if (comment.authorId !== viewer.id && !levelAllows(level, 'share')) throw forbidden()

  return comment
}

/**
 * Resolve or reopen a comment
 * @param {string} commentId - Comment id
 * @param {PageViewer} viewer - Member acting
 * @param {boolean} resolved - Resolved state
 * @return {Promise<PageCommentView>} - Comment
 */

export const resolveComment = async (commentId: string, viewer: PageViewer, resolved: boolean): Promise<PageCommentView> => {
  const comment = await requireOwnComment(commentId, viewer)
  const row = await prisma.pageComment.update({
    where: { id: comment.id },
    data: { resolvedAt: resolved ? new Date() : null },
    select: COMMENT_SELECT,
  })

  return toView(row, viewer.id)
}

/**
 * Delete a comment
 * @param {string} commentId - Comment id
 * @param {PageViewer} viewer - Member acting
 * @return {Promise<{ id: string }>} - Deleted comment
 */

export const deleteComment = async (commentId: string, viewer: PageViewer): Promise<{ id: string }> => {
  const comment = await requireOwnComment(commentId, viewer)
  await prisma.pageComment.delete({ where: { id: comment.id } })

  return { id: comment.id }
}
