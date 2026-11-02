import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import type { AccessNode, PageViewer } from '@/core/lib/pages'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import type { SessionUser } from '@/types/auth'
import type { PageCrumb, PageSummary } from '@/types/pages'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Raw id looks like a page id
 * @param {string} id - Candidate
 * @return {boolean} - Well formed
 */

export const isPageId = (id: unknown): id is string => typeof id === 'string' && UUID_PATTERN.test(id)

/**
 * Member reading pages
 * @param {SessionUser} session - Signed-in member
 * @return {PageViewer} - Viewer
 */

export const viewerOf = (session: SessionUser): PageViewer => ({ id: session.id, role: session.role })

/**
 * Columns the access check reads
 * @type {Prisma.PageSelect}
 */

export const ACCESS_SELECT = {
  id: true,
  ownerId: true,
  parentId: true,
  title: true,
  icon: true,
  inheritAccess: true,
  trashedAt: true,
  grants: { select: { scope: true, accountId: true, role: true, level: true } },
} satisfies Prisma.PageSelect

export type ChainRow = Prisma.PageGetPayload<{ select: typeof ACCESS_SELECT }>

/**
 * Page then its ancestors, closest first
 * @param {string} pageId - Page id
 * @return {Promise<ChainRow[]>} - Ancestry
 */

export const loadChain = async (pageId: string): Promise<ChainRow[]> => {
  const chain: ChainRow[] = []
  let nextId: string | null = pageId

  // Bounded climb, a cycle never loops
  while (nextId && chain.length < PAGE_SETTINGS.treeMaxDepth) {
    const row: ChainRow | null = await prisma.page.findUnique({ where: { id: nextId }, select: ACCESS_SELECT })
    if (!row || chain.some((entry) => entry.id === row.id)) break

    chain.push(row)
    nextId = row.parentId
  }

  return chain
}

/**
 * Chain row as the resolver reads it
 * @param {ChainRow} row - Chain row
 * @return {AccessNode} - Access node
 */

export const toAccessNode = (row: ChainRow): AccessNode => ({
  id: row.id,
  ownerId: row.ownerId,
  inheritAccess: row.inheritAccess,
  grants: row.grants,
})

/**
 * Trail step of a page
 * @param {{ id: string, title: string, icon: string | null }} row - Page
 * @return {PageCrumb} - Crumb
 */

export const toCrumb = (row: { id: string; title: string; icon: string | null }): PageCrumb => ({
  id: row.id,
  title: row.title,
  icon: row.icon,
})

/**
 * Columns of a listed page
 * @type {Prisma.PageSelect}
 */

export const SUMMARY_SELECT = {
  id: true,
  parentId: true,
  categoryId: true,
  title: true,
  icon: true,
  position: true,
  ownerId: true,
  inheritAccess: true,
  updatedAt: true,
  _count: { select: { grants: true } },
} satisfies Prisma.PageSelect

export type SummaryRow = Prisma.PageGetPayload<{ select: typeof SUMMARY_SELECT }>

/**
 * Listed page
 * @param {SummaryRow} row - Page row
 * @param {string} viewerId - Member reading
 * @return {PageSummary} - Summary
 */

export const toSummary = (row: SummaryRow, viewerId: string): PageSummary => ({
  id: row.id,
  parentId: row.parentId,
  categoryId: row.categoryId,
  title: row.title,
  icon: row.icon,
  position: row.position,
  isOwn: row.ownerId === viewerId,
  isShared: row._count.grants > 0,
  updatedAt: row.updatedAt.toISOString(),
})

/**
 * Next free sibling position
 * @param {string | null} parentId - Parent page
 * @param {string} ownerId - Owner of a root page
 * @param {string | null} [categoryId] - Category of a root page
 * @return {Promise<number>} - Position
 */

export const nextPosition = async (
  parentId: string | null,
  ownerId: string,
  categoryId: string | null = null
): Promise<number> => {
  const last = await prisma.page.findFirst({
    where: parentId ? { parentId } : { parentId: null, ownerId, categoryId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  return (last?.position ?? -1) + 1
}
