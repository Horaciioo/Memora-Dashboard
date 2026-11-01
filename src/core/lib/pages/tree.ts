import type { PageSummary } from '@/types/pages'

/**
 * Page with its children
 * @typedef {Object} PageTreeNode
 * @property {PageSummary} page - Page
 * @property {PageTreeNode[]} children - Sub pages
 */

export interface PageTreeNode {
  page: PageSummary
  children: PageTreeNode[]
}

/**
 * Sibling order
 * @param {PageSummary} left - One page
 * @param {PageSummary} right - Other page
 * @return {number} - Sort order
 */

const bySiblingOrder = (left: PageSummary, right: PageSummary): number =>
  left.position - right.position || left.title.localeCompare(right.title)

/**
 * Nest a flat list, a page whose parent is out of reach becomes a root
 * @param {PageSummary[]} pages - Reachable pages
 * @return {PageTreeNode[]} - Roots
 */

export const buildPageTree = (pages: PageSummary[]): PageTreeNode[] => {
  const known = new Set(pages.map((page) => page.id))
  const byParent = Map.groupBy(
    pages.toSorted(bySiblingOrder),
    (page) => (page.parentId && known.has(page.parentId) ? page.parentId : null)
  )

  // Guards a corrupt cycle
  const visit = (page: PageSummary, seen: Set<string>): PageTreeNode => ({
    page,
    children: seen.has(page.id)
      ? []
      : (byParent.get(page.id) ?? []).map((child) => visit(child, new Set([...seen, page.id]))),
  })

  return (byParent.get(null) ?? []).map((page) => visit(page, new Set()))
}

/**
 * Pages under one page, any depth
 * @param {PageSummary[]} pages - Reachable pages
 * @param {string} rootId - Top page
 * @return {Set<string>} - Descendant ids
 */

export const descendantIds = (pages: { id: string; parentId: string | null }[], rootId: string): Set<string> => {
  const found = new Set<string>()
  let frontier = [rootId]

  while (frontier.length > 0) {
    const next = pages.filter((page) => page.parentId && frontier.includes(page.parentId) && !found.has(page.id))
    next.forEach((page) => found.add(page.id))
    frontier = next.map((page) => page.id)
  }

  return found
}
