import { NAVIGATION } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import type { IconName } from '@/declarations/ui/icons'
import type { PageSummary } from '@/types/pages'

/**
 * Line of the home favorites box
 * @typedef {Object} FavoriteLine
 * @property {string} href - Where it leads
 * @property {string} label - Name shown
 * @property {IconName} icon - Glyph when there is no emoji
 * @property {string | null} emoji - Emoji of a page
 */

export interface FavoriteLine {
  href: string
  label: string
  icon: IconName
  emoji: string | null
}

const PAGE_PATH = /^\/pages\/([0-9a-f-]{36})$/i

const NAV_ITEMS = new Map(
  NAVIGATION.flatMap((group) => group.items).map((item) => [item.href, item])
)

/**
 * Line of a private page
 * @param {PageSummary} page - Page listed
 * @return {FavoriteLine} - Line
 */

export const pageLine = (page: PageSummary): FavoriteLine => ({
  href: `/pages/${page.id}`,
  label: page.title || PAGES_COPY.untitled,
  icon: 'page',
  emoji: page.icon,
})

/**
 * Line of a path, a page or a rail entry
 * @param {string} path - Path visited or starred
 * @param {Map<string, PageSummary>} pages - Pages known by id
 * @param {string} [fallback] - Name kept with a star
 * @return {FavoriteLine | null} - Line, null when the path is unknown
 */

export const pathLine = (
  path: string,
  pages: Map<string, PageSummary>,
  fallback?: string
): FavoriteLine | null => {
  const page = pages.get(PAGE_PATH.exec(path)?.[1] ?? '')
  if (page) return pageLine(page)

  const item = NAV_ITEMS.get(path)
  if (item) return { href: path, label: item.label, icon: item.icon, emoji: null }

  return fallback ? { href: path, label: fallback, icon: 'page', emoji: null } : null
}
