import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { CHANGELOG_RELEASES, CHANGELOG_TAGS } from '@/declarations/changelog/releases'
import type {
  ChangelogComment,
  ChangelogItem,
  ChangelogPage,
  ChangelogRelease,
  ChangelogTag,
} from '@/declarations/changelog/releases'
import { NAVIGATION, ROUTES, SEGMENT_LABELS } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'
import type { PermissionName } from '@/utils/constants/permissions'

// Rail glyph per page
const PAGE_ICONS = new Map<string, IconName>(
  NAVIGATION.flatMap((group) => group.items.map((item) => [item.href, item.icon] as const))
)

// Pages outside the rail
const FALLBACK_ICON: IconName = 'dashboard'

/**
 * Page display
 * @typedef {Object} ChangelogPageMeta
 * @property {string} label - Page name
 * @property {IconName} icon - Page glyph
 */

export interface ChangelogPageMeta {
  label: string
  icon: IconName
}

/**
 * Page of a line
 * @param {ChangelogPage} [page] - Concerned page
 * @return {ChangelogPageMeta} - Name and glyph
 */

export const changelogPage = (page?: ChangelogPage): ChangelogPageMeta => {
  if (!page) return { label: CHANGELOG_COPY.wholeApp, icon: FALLBACK_ICON }

  const segment = page.split('/').filter(Boolean).at(-1) ?? ''

  return {
    label: SEGMENT_LABELS[segment] ?? CHANGELOG_COPY.wholeApp,
    icon: PAGE_ICONS.get(page) ?? FALLBACK_ICON,
  }
}

/**
 * Notes a member may read
 * @param {(permission: PermissionName) => boolean} can - Permission check
 * @return {ChangelogRelease[]} - Filtered notes
 */

export const changelogFor = (can: (permission: PermissionName) => boolean): ChangelogRelease[] => {
  const readable = (entry: { permission?: PermissionName }) =>
    !entry.permission || can(entry.permission)

  return CHANGELOG_RELEASES.map((release) => ({
    ...release,
    items: release.items.filter(readable),
    comments: (release.comments ?? []).filter(readable),
  })).filter((release) => release.items.length > 0)
}

/**
 * Lines of one page
 * @typedef {Object} ChangelogPageGroup
 * @property {string} key - Page key
 * @property {ChangelogPageMeta} page - Page display
 * @property {ChangelogItem[]} items - Lines
 * @property {string | null} comment - Team word
 */

export interface ChangelogPageGroup {
  key: string
  page: ChangelogPageMeta
  items: ChangelogItem[]
  comment: string | null
}

/**
 * Lines grouped by page
 * @param {ChangelogItem[]} items - One category
 * @param {ChangelogComment[]} [comments] - Same category
 * @return {ChangelogPageGroup[]} - First seen order
 */

export const groupByPage = (
  items: ChangelogItem[],
  comments: ChangelogComment[] = []
): ChangelogPageGroup[] => {
  const groups = new Map<string, ChangelogPageGroup>()

  for (const item of items) {
    const key = item.page ?? 'app'
    const group = groups.get(key) ?? {
      key,
      page: changelogPage(item.page),
      items: [],
      comment:
        comments
          .filter((comment) => (comment.page ?? 'app') === key)
          .map((comment) => comment.text)
          .join(' ') || null,
    }
    group.items.push(item)
    groups.set(key, group)
  }

  return [...groups.values()]
}

/**
 * One filled category
 * @typedef {Object} ChangelogCategory
 * @property {ChangelogTag} tag - Category
 * @property {ChangelogItem[]} items - Lines
 * @property {ChangelogComment[]} comments - Team words
 */

export interface ChangelogCategory {
  tag: ChangelogTag
  items: ChangelogItem[]
  comments: ChangelogComment[]
}

/**
 * Filled categories
 * @param {ChangelogRelease} release - Read note
 * @return {ChangelogCategory[]} - Reading order
 */

export const releaseCategories = (release: ChangelogRelease): ChangelogCategory[] =>
  (Object.keys(CHANGELOG_TAGS) as ChangelogTag[])
    .map((tag) => ({
      tag,
      items: release.items.filter((item) => item.tag === tag),
      comments: (release.comments ?? []).filter((comment) => comment.tag === tag),
    }))
    .filter((category) => category.items.length > 0)

/**
 * Notes of one month
 * @typedef {Object} ChangelogMonth
 * @property {string} key - YYYY-MM
 * @property {ChangelogRelease[]} releases - Month notes
 */

export interface ChangelogMonth {
  key: string
  releases: ChangelogRelease[]
}

/**
 * Notes grouped by month
 * @param {ChangelogRelease[]} releases - Newest first
 * @return {ChangelogMonth[]} - Newest month first
 */

export const groupByMonth = (releases: ChangelogRelease[]): ChangelogMonth[] => {
  const months = new Map<string, ChangelogRelease[]>()

  for (const release of releases) {
    const key = release.date.slice(0, 7)
    months.set(key, [...(months.get(key) ?? []), release])
  }

  return [...months.entries()].map(([key, list]) => ({ key, releases: list }))
}

/**
 * Address of one note
 * @param {string} version - Note version
 * @return {string} - Page address
 */

export const changelogPath = (version: string): string =>
  `${ROUTES.changelog}?version=${encodeURIComponent(version)}`

/**
 * Note to open
 * @param {ChangelogRelease[]} releases - Readable notes
 * @param {string} [version] - Asked version
 * @return {ChangelogRelease | null} - Asked or latest
 */

export const resolveRelease = (
  releases: ChangelogRelease[],
  version?: string
): ChangelogRelease | null =>
  releases.find((release) => release.version === version) ?? releases[0] ?? null
