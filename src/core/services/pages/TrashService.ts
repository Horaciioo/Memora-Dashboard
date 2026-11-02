import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { levelAllows } from '@/core/lib/pages'
import type { PageViewer } from '@/core/lib/pages'
import { levelOnChain, requirePage } from '@/core/services/pages/AccessService'
import { journalPage } from '@/core/services/pages/journal'
import { signalAccess } from '@/core/services/pages/signal'
import { loadChain } from '@/core/services/pages/lookups'
import type { TrashedPage } from '@/types/pages'

/**
 * Page and every page under it
 * @param {string} rootId - Top page
 * @return {Promise<string[]>} - Ids, root first
 */

const subtreeIds = async (rootId: string): Promise<string[]> => {
  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    WITH RECURSIVE tree AS (
      SELECT id FROM pages WHERE id = ${rootId}
      UNION
      SELECT c.id FROM pages c JOIN tree t ON c."parentId" = t.id
    )
    SELECT id FROM tree
  `)

  return rows.map((row) => row.id)
}

/**
 * Move a page and its sub pages to the trash
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member removing
 * @return {Promise<{ id: string }>} - Trashed page
 */

export const trashPage = async (pageId: unknown, viewer: PageViewer): Promise<{ id: string }> => {
  const { page } = await requirePage(pageId, viewer, 'trash')
  const ids = await subtreeIds(page.id)

  // Already trashed pages keep their own root
  await prisma.page.updateMany({
    where: { id: { in: ids }, trashedAt: null },
    data: { trashedAt: new Date(), trashedById: viewer.id, trashRootId: page.id },
  })

  await journalPage({ eventType: 'PageTrashed', actorId: viewer.id, pageId: page.id, summary: page.title })
  await signalAccess()

  return { id: page.id }
}

/**
 * Bring a page and what left with it back
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member restoring
 * @return {Promise<{ id: string }>} - Restored page
 */

export const restorePage = async (pageId: unknown, viewer: PageViewer): Promise<{ id: string }> => {
  const { page, chain } = await requirePage(pageId, viewer, 'trash', { allowTrashed: true })
  const row = await prisma.page.findUniqueOrThrow({ where: { id: page.id }, select: { trashRootId: true } })
  if (!page.trashedAt || !row.trashRootId) throw notFound()

  // Same sweep, under this page
  const ids = await subtreeIds(page.id)
  const isParentGone = chain.slice(1).some((ancestor) => ancestor.trashedAt !== null)

  await prisma.$transaction([
    prisma.page.updateMany({
      where: { id: { in: ids }, trashRootId: row.trashRootId },
      data: { trashedAt: null, trashedById: null, trashRootId: null },
    }),
    // A parent still in the trash lets go
    ...(isParentGone ? [prisma.page.update({ where: { id: page.id }, data: { parentId: null } })] : []),
  ])

  await journalPage({ eventType: 'PageRestored', actorId: viewer.id, pageId: page.id, summary: page.title })

  return { id: page.id }
}

/**
 * Erase a trashed page, its sub pages and pictures
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member erasing
 * @return {Promise<{ id: string }>} - Erased page
 */

export const purgePage = async (pageId: unknown, viewer: PageViewer): Promise<{ id: string }> => {
  const { page } = await requirePage(pageId, viewer, 'trash', { allowTrashed: true })
  if (!page.trashedAt) throw notFound()

  const ids = await subtreeIds(page.id)
  const media = await prisma.pageMedia.findMany({ where: { pageId: { in: ids } }, select: { storageEntryId: true } })

  // Children cascade from the page row
  await prisma.$transaction([
    prisma.page.delete({ where: { id: page.id } }),
    prisma.storageEntry.deleteMany({ where: { id: { in: media.map((entry) => entry.storageEntryId) } } }),
  ])

  await journalPage({ eventType: 'PagePurged', actorId: viewer.id, pageId: page.id, summary: page.title })
  await signalAccess()

  return { id: page.id }
}

/**
 * Trashed pages a member may restore
 * @param {PageViewer} viewer - Member asking
 * @return {Promise<TrashedPage[]>} - Trash
 */

export const listTrash = async (viewer: PageViewer): Promise<TrashedPage[]> => {
  const roots = await prisma.page.findMany({
    where: { trashedAt: { not: null }, trashRootId: { not: null } },
    select: { id: true, title: true, icon: true, trashedAt: true, trashRootId: true },
    orderBy: { trashedAt: 'desc' },
  })

  // Each entry checked on its own chain
  const kept = await Promise.all(
    roots
      .filter((row) => row.trashRootId === row.id)
      .map(async (row) => (levelAllows(levelOnChain(await loadChain(row.id), viewer), 'trash') ? row : null))
  )

  return kept
    .filter((row) => row !== null)
    .map((row) => ({ id: row.id, title: row.title, icon: row.icon, trashedAt: row.trashedAt!.toISOString() }))
}
