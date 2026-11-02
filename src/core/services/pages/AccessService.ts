import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { levelAllows, resolvePageLevel } from '@/core/lib/pages'
import type { PageViewer } from '@/core/lib/pages'
import { PAGE_TARGET } from '@/core/services/pages/journal'
import { isPageId, loadChain, toAccessNode } from '@/core/services/pages/lookups'
import type { ChainRow } from '@/core/services/pages/lookups'
import { recordEvent } from '@/core/services/system/ActivityService'
import type { PageCapability, PageLevelName } from '@/declarations/pages/access'

/**
 * Page a member reached
 * @typedef {Object} ReachedPage
 * @property {ChainRow} page - Page row
 * @property {ChainRow[]} chain - Page then ancestors
 * @property {PageLevelName} level - Effective level
 * @property {boolean} isTrashed - Page or an ancestor is in the trash
 */

export interface ReachedPage {
  page: ChainRow
  chain: ChainRow[]
  level: PageLevelName
  isTrashed: boolean
}

/**
 * Level of a member on a loaded chain
 * @param {ChainRow[]} chain - Page then ancestors
 * @param {PageViewer} viewer - Member asking
 * @return {PageLevelName | null} - Effective level
 */

export const levelOnChain = (chain: ChainRow[], viewer: PageViewer): PageLevelName | null =>
  resolvePageLevel(chain.map(toAccessNode), viewer)

/**
 * Keep a refused attempt, page id only
 * @param {PageViewer} viewer - Member refused
 * @param {string} pageId - Page asked
 * @return {Promise<void>} - Recorded
 */

const journalDenial = (viewer: PageViewer, pageId: string): Promise<void> =>
  recordEvent({
    eventType: 'AccessDenied',
    origin: 'System',
    actorId: viewer.id,
    targetType: PAGE_TARGET,
    targetId: pageId,
    summary: PAGE_TARGET,
  }).catch(() => undefined)

/**
 * Open a page for one gesture, refused by default
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member asking
 * @param {PageCapability} capability - Gesture
 * @param {Object} [options] - Options
 * @param {boolean} [options.allowTrashed] - A trashed page answers too
 * @return {Promise<ReachedPage>} - Reached page
 */

export const requirePage = async (
  pageId: unknown,
  viewer: PageViewer,
  capability: PageCapability,
  options: { allowTrashed?: boolean } = {}
): Promise<ReachedPage> => {
  if (!isPageId(pageId)) throw notFound()

  const chain = await loadChain(pageId)
  const page = chain[0]
  if (!page) throw notFound()

  const level = levelOnChain(chain, viewer)
  const isTrashed = chain.some((row) => row.trashedAt !== null)

  // Unknown and closed pages look the same
  if (!levelAllows(level, 'read')) {
    await journalDenial(viewer, page.id)
    throw notFound()
  }

  // The trash opens to who may empty it
  if (isTrashed && !(options.allowTrashed && levelAllows(level, 'trash'))) throw notFound()
  if (!levelAllows(level, capability)) throw forbidden()

  return { page, chain, level: level as PageLevelName, isTrashed }
}

/**
 * Every page a member may open, one query
 * @param {PageViewer} viewer - Member asking
 * @return {Promise<string[]>} - Page ids
 */

export const reachablePageIds = async (viewer: PageViewer): Promise<string[]> => {
  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    WITH RECURSIVE reach AS (
      SELECT p.id FROM pages p
      WHERE p."trashedAt" IS NULL AND (
        p."ownerId" = ${viewer.id}
        OR EXISTS (
          SELECT 1 FROM page_grants g
          WHERE g."pageId" = p.id AND (
            g.scope = 'WORKSPACE'
            OR (g.scope = 'ROLE' AND g.role::text = ${viewer.role})
            OR (g.scope = 'ACCOUNT' AND g."accountId" = ${viewer.id})
          )
        )
      )
      UNION
      SELECT c.id FROM pages c
      JOIN reach r ON c."parentId" = r.id
      WHERE c."inheritAccess" AND c."trashedAt" IS NULL
    )
    SELECT DISTINCT id FROM reach
  `)

  return rows.map((row) => row.id)
}

/**
 * Members among a list who may read a page
 * @param {string} pageId - Page id
 * @param {string[]} accountIds - Candidates
 * @return {Promise<string[]>} - Readers
 */

export const readersOf = async (pageId: string, accountIds: string[]): Promise<string[]> => {
  if (accountIds.length === 0) return []
  const chain = await loadChain(pageId)
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, role: true },
  })

  return accounts
    .filter((account) => levelAllows(levelOnChain(chain, account), 'read'))
    .map((account) => account.id)
}
