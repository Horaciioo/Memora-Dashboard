import 'server-only'

import { prosemirrorJSONToYXmlFragment } from '@tiptap/y-tiptap'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { PageViewer } from '@/core/lib/pages'
import { PAGE_DOC_FIELD, PAGE_SCHEMA } from '@/core/lib/pages/schema'
import { editDoc } from '@/core/lib/realtime/server/docs'
import { requirePage } from '@/core/services/pages/AccessService'
import { journalPage } from '@/core/services/pages/journal'
import { pageDocStore } from '@/core/services/pages/PageDocService'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_TOPICS } from '@/declarations/pages/topics'
import type { PageDocument, PageRevisionDetail, PageRevisionSummary } from '@/types/pages'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Keep a snapshot once the last one is old enough
 * @param {string} pageId - Page id
 * @param {string} authorId - Member who saved
 * @param {boolean} [isForced] - Ignores the spacing
 * @return {Promise<void>} - Kept or skipped
 */

export const snapshotRevision = async (
  pageId: string,
  authorId: string,
  isForced = false
): Promise<void> => {
  const last = await prisma.pageRevision.findFirst({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  const isRecent =
    last && Date.now() - last.createdAt.getTime() < PAGE_SETTINGS.revisionEveryMinutes * MINUTE_MS
  if (isRecent && !isForced) return

  const page = await prisma.page.findUniqueOrThrow({
    where: { id: pageId },
    select: { version: true, title: true, content: true },
  })

  await prisma.pageRevision.create({
    data: {
      pageId,
      version: page.version,
      title: page.title,
      content: page.content ?? {},
      authorId,
    },
  })

  // Oldest snapshots fall off
  const stale = await prisma.pageRevision.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
    skip: PAGE_SETTINGS.revisionsKept,
    select: { id: true },
  })
  if (stale.length > 0)
    await prisma.pageRevision.deleteMany({ where: { id: { in: stale.map((row) => row.id) } } })
}

const REVISION_SELECT = {
  id: true,
  version: true,
  title: true,
  createdAt: true,
  author: { select: { displayName: true } },
} as const

/**
 * Revision row for display
 * @param {Object} row - Revision row
 * @return {PageRevisionSummary} - Revision
 */

const toRevision = (row: {
  id: string
  version: number
  title: string
  createdAt: Date
  author: { displayName: string } | null
}): PageRevisionSummary => ({
  id: row.id,
  version: row.version,
  title: row.title,
  createdAt: row.createdAt.toISOString(),
  authorName: row.author?.displayName ?? null,
})

/**
 * Kept versions of a page, newest first
 * @param {unknown} pageId - Page id
 * @param {PageViewer} viewer - Member reading
 * @return {Promise<PageRevisionSummary[]>} - Versions
 */

export const listRevisions = async (
  pageId: unknown,
  viewer: PageViewer
): Promise<PageRevisionSummary[]> => {
  const { page } = await requirePage(pageId, viewer, 'read')
  const rows = await prisma.pageRevision.findMany({
    where: { pageId: page.id },
    orderBy: { createdAt: 'desc' },
    select: REVISION_SELECT,
  })

  return rows.map(toRevision)
}

/**
 * One kept version with its content
 * @param {unknown} pageId - Page id
 * @param {string} revisionId - Version id
 * @param {PageViewer} viewer - Member reading
 * @return {Promise<PageRevisionDetail>} - Version
 */

export const readRevision = async (
  pageId: unknown,
  revisionId: string,
  viewer: PageViewer
): Promise<PageRevisionDetail> => {
  const { page } = await requirePage(pageId, viewer, 'read')
  const row = await prisma.pageRevision.findFirst({
    where: { id: revisionId, pageId: page.id },
    select: { ...REVISION_SELECT, content: true },
  })
  if (!row) throw notFound()

  return { ...toRevision(row), content: row.content as unknown as PageDocument }
}

/**
 * Bring a version back as a new one, the current kept first
 * @param {unknown} pageId - Page id
 * @param {string} revisionId - Version id
 * @param {PageViewer} viewer - Member restoring
 * @return {Promise<{ id: string }>} - Restored version
 */

export const restoreRevision = async (
  pageId: unknown,
  revisionId: string,
  viewer: PageViewer
): Promise<{ id: string }> => {
  const { page } = await requirePage(pageId, viewer, 'write')
  const revision = await prisma.pageRevision.findFirst({
    where: { id: revisionId, pageId: page.id },
    select: { id: true, version: true, content: true },
  })
  if (!revision) throw notFound()

  await snapshotRevision(page.id, viewer.id, true)
  await editDoc({
    topic: PAGE_TOPICS.page(page.id),
    store: pageDocStore(page.id),
    actorId: viewer.id,
    change: (doc) => {
      const fragment = doc.getXmlFragment(PAGE_DOC_FIELD)
      fragment.delete(0, fragment.length)
      prosemirrorJSONToYXmlFragment(PAGE_SCHEMA, revision.content, fragment)
    },
  })
  await journalPage({
    eventType: 'PageVersionRestored',
    actorId: viewer.id,
    pageId: page.id,
    summary: String(revision.version),
  })

  return { id: revision.id }
}
