import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { levelAllows } from '@/core/lib/pages'
import type { PageViewer } from '@/core/lib/pages'
import { readersOf, requirePage } from '@/core/services/pages/AccessService'
import { notify, notifyMentions } from '@/core/services/system/NotificationService'
import { signalPage } from '@/core/services/pages/signal'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_DOCUMENT_COPY } from '@/declarations/pages/copy'
import { PAGE_STREAM_EVENTS } from '@/declarations/pages/topics'
import type { PageCommentView } from '@/types/pages'

const COMMENT_SELECT = {
  id: true,
  pageId: true,
  parentId: true,
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
    parentId: string | null
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
  parentId: row.parentId,
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

export const listComments = async (
  pageId: unknown,
  viewer: PageViewer
): Promise<PageCommentView[]> => {
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

  const root = await rootOf(page.id, raw.parentId)
  const row = await prisma.pageComment.create({
    data: {
      pageId: page.id,
      authorId: viewer.id,
      body,
      parentId: root?.id ?? null,
      // A reply sits where its thread sits
      blockId: root
        ? root.blockId
        : typeof raw.blockId === 'string' && raw.blockId
          ? raw.blockId.slice(0, 64)
          : null,
    },
    select: COMMENT_SELECT,
  })
  await signalPage(page.id, PAGE_STREAM_EVENTS.comments)
  await notifyComment({
    pageId: page.id,
    title: page.title,
    actorId: viewer.id,
    body,
    rootId: root?.id ?? null,
  })

  return toView(row, viewer.id)
}

/**
 * Thread a reply joins, roots only
 * @param {string} pageId - Page id
 * @param {unknown} parentId - Raw parent
 * @return {Promise<{ id: string, blockId: string | null } | null>} - Root, null for a new thread
 */

const rootOf = async (
  pageId: string,
  parentId: unknown
): Promise<{ id: string; blockId: string | null } | null> => {
  if (parentId === undefined || parentId === null || parentId === '') return null
  const root =
    typeof parentId === 'string'
      ? await prisma.pageComment.findFirst({
          where: { id: parentId, pageId, parentId: null },
          select: { id: true, blockId: true },
        })
      : null
  if (!root) throw notFound()

  return root
}

/**
 * Mentions and thread replies, readers only
 * @param {Object} input - Comment
 * @param {string} input.pageId - Page id
 * @param {string} input.title - Page title
 * @param {string} input.actorId - Author
 * @param {string} input.body - Text
 * @param {string | null} input.rootId - Thread joined
 * @return {Promise<void>} - Raised
 */

const notifyComment = async (input: {
  pageId: string
  title: string
  actorId: string
  body: string
  rootId: string | null
}): Promise<void> => {
  const where = {
    actorId: input.actorId,
    target: 'page' as const,
    targetId: input.pageId,
    subject: input.title,
  }
  const allow = (ids: string[]) => readersOf(input.pageId, ids)
  await notifyMentions(input.body, where, allow)
  if (!input.rootId) return

  // Everyone already in the thread
  const thread = await prisma.pageComment.findMany({
    where: { OR: [{ id: input.rootId }, { parentId: input.rootId }] },
    select: { authorId: true },
  })
  const authors = thread.flatMap((entry) => (entry.authorId ? [entry.authorId] : []))
  await notify({ ...where, kind: 'CommentReplied', recipients: await allow([...new Set(authors)]) })
}

/**
 * Comment the member may change: author or full access
 * @param {string} commentId - Comment id
 * @param {PageViewer} viewer - Member acting
 * @return {Promise<{ id: string, pageId: string }>} - Comment
 */

const requireOwnComment = async (
  commentId: string,
  viewer: PageViewer
): Promise<{ id: string; pageId: string }> => {
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

export const resolveComment = async (
  commentId: string,
  viewer: PageViewer,
  resolved: boolean
): Promise<PageCommentView> => {
  const comment = await requireOwnComment(commentId, viewer)
  const row = await prisma.pageComment.update({
    where: { id: comment.id },
    data: { resolvedAt: resolved ? new Date() : null },
    select: COMMENT_SELECT,
  })
  await signalPage(comment.pageId, PAGE_STREAM_EVENTS.comments)

  return toView(row, viewer.id)
}

/**
 * Delete a comment
 * @param {string} commentId - Comment id
 * @param {PageViewer} viewer - Member acting
 * @return {Promise<{ id: string }>} - Deleted comment
 */

export const deleteComment = async (
  commentId: string,
  viewer: PageViewer
): Promise<{ id: string }> => {
  const comment = await requireOwnComment(commentId, viewer)
  await prisma.pageComment.delete({ where: { id: comment.id } })
  await signalPage(comment.pageId, PAGE_STREAM_EVENTS.comments)

  return { id: comment.id }
}
