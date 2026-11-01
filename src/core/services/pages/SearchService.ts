import 'server-only'

import { prisma } from '@/core/lib/db'
import type { PageViewer } from '@/core/lib/pages'
import { reachablePageIds } from '@/core/services/pages/AccessService'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { PAGES_COPY } from '@/declarations/pages/copy'
import type { PageSearchHit } from '@/types/pages'

// Characters around a match
const EXCERPT_RADIUS = 60

/**
 * Text around the first match
 * @param {string} text - Page text
 * @param {string} term - Searched words
 * @return {string} - Excerpt
 */

export const excerptAround = (text: string, term: string): string => {
  const at = text.toLowerCase().indexOf(term.toLowerCase())
  if (at < 0) return text.slice(0, EXCERPT_RADIUS * 2).replace(/\s+/g, ' ').trim()

  const start = Math.max(0, at - EXCERPT_RADIUS)
  const end = Math.min(text.length, at + term.length + EXCERPT_RADIUS)

  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`
}

/**
 * Search the pages a member may open, nothing else
 * @param {PageViewer} viewer - Member searching
 * @param {string} term - Raw term
 * @return {Promise<PageSearchHit[]>} - Hits
 */

export const searchPages = async (viewer: PageViewer, term: string): Promise<PageSearchHit[]> => {
  const query = term.trim()
  if (query.length < SEARCH_SETTINGS.minLength) return []

  const ids = await reachablePageIds(viewer)
  if (ids.length === 0) return []

  const contains = { contains: query, mode: 'insensitive' } as const
  const [rows, titles] = await Promise.all([
    prisma.page.findMany({
      where: { id: { in: ids }, OR: [{ title: contains }, { searchText: contains }] },
      select: { id: true, parentId: true, title: true, icon: true, searchText: true },
      orderBy: { contentAt: 'desc' },
      take: PAGE_SETTINGS.searchResults,
    }),
    prisma.page.findMany({ where: { id: { in: ids } }, select: { id: true, parentId: true, title: true } }),
  ])

  // Trail through readable parents only
  const byId = new Map(titles.map((row) => [row.id, row]))
  const trailOf = (parentId: string | null, seen = new Set<string>()): string[] => {
    const parent = parentId ? byId.get(parentId) : undefined
    if (!parent || seen.has(parent.id)) return []

    return [...trailOf(parent.parentId, seen.add(parent.id)), parent.title || PAGES_COPY.untitled]
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    icon: row.icon,
    excerpt: excerptAround(row.searchText, query),
    trail: trailOf(row.parentId),
  }))
}
