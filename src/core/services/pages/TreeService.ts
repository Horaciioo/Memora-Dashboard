import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput } from '@/core/lib/errors'
import type { PageViewer } from '@/core/lib/pages'
import { requirePage } from '@/core/services/pages/AccessService'
import { requireCategory } from '@/core/services/pages/CategoryService'
import { journalPage } from '@/core/services/pages/journal'
import { SUMMARY_SELECT, loadChain, toSummary } from '@/core/services/pages/lookups'
import { PAGE_DOCUMENT_COPY } from '@/declarations/pages/copy'
import type { PageSummary } from '@/types/pages'

/**
 * Move a page under another, or to the root, at a position
 * @param {string} pageId - Page moved
 * @param {PageViewer} viewer - Member moving
 * @param {Object} input - Destination
 * @param {unknown} input.parentId - New parent, null for the root
 * @param {unknown} [input.categoryId] - Category of a root page
 * @param {unknown} input.position - Index among the new siblings
 * @return {Promise<PageSummary>} - Moved page
 */

export const movePage = async (
  pageId: unknown,
  viewer: PageViewer,
  input: { parentId: unknown; categoryId?: unknown; position: unknown }
): Promise<PageSummary> => {
  const { page } = await requirePage(pageId, viewer, 'organize')
  const owner = await prisma.page.findUniqueOrThrow({
    where: { id: page.id },
    select: { ownerId: true },
  })

  // The destination takes writes from the mover
  const parentId = input.parentId
    ? (await requirePage(input.parentId, viewer, 'write')).page.id
    : null
  if (parentId && (await loadChain(parentId)).some((row) => row.id === page.id)) {
    throw invalidInput([{ field: 'parentId', message: PAGE_DOCUMENT_COPY.moveLoop }])
  }

  // A category holds root pages of its owner
  const categoryId =
    !parentId && input.categoryId ? (await requireCategory(input.categoryId, viewer)).id : null
  if (categoryId && owner.ownerId !== viewer.id) throw forbidden()

  const siblings = await prisma.page.findMany({
    where: {
      id: { not: page.id },
      trashedAt: null,
      ...(parentId ? { parentId } : { parentId: null, ownerId: owner.ownerId, categoryId }),
    },
    orderBy: { position: 'asc' },
    select: { id: true },
  })

  // Renumber the new sibling row
  const index =
    typeof input.position === 'number'
      ? Math.max(0, Math.min(siblings.length, Math.floor(input.position)))
      : siblings.length
  const order = [
    ...siblings.slice(0, index).map((row) => row.id),
    page.id,
    ...siblings.slice(index).map((row) => row.id),
  ]

  await prisma.$transaction([
    prisma.page.update({ where: { id: page.id }, data: { parentId, categoryId } }),
    ...order.map((id, position) => prisma.page.update({ where: { id }, data: { position } })),
  ])

  await journalPage({
    eventType: 'PageMoved',
    actorId: viewer.id,
    pageId: page.id,
    summary: page.title,
    payload: { from: page.parentId, to: parentId, categoryId },
  })

  const row = await prisma.page.findUniqueOrThrow({
    where: { id: page.id },
    select: SUMMARY_SELECT,
  })

  return toSummary(row, viewer.id)
}
