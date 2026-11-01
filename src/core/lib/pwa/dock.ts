import type { NavigationGroup, NavigationItem } from '@/declarations/navigation'
import { DOCK_DEFAULTS, DOCK_FALLBACKS, DOCK_HOME_PATH } from '@/declarations/pwa/dock'

/**
 * Pages a member may put in the dock
 * @param {NavigationGroup[]} groups - Rail groups the member sees
 * @param {readonly string[]} held - Pages held back on a phone
 * @return {NavigationItem[]} - Destinations, once each, Home aside
 */

export const dockCandidatesOf = (
  groups: NavigationGroup[],
  held: readonly string[]
): NavigationItem[] => {
  const seen = new Set<string>([DOCK_HOME_PATH, ...held])

  return groups
    .flatMap((group) => group.items)
    .filter((item) => {
      if (seen.has(item.href)) return false

      seen.add(item.href)

      return true
    })
}

/**
 * Pages beside Home, slot by slot: the member's pick, else the proposed page, else the first
 * allowed fallback not in the row yet
 * @param {readonly string[]} saved - Picks of the member by slot, empty for the proposed page
 * @param {NavigationItem[]} candidates - Pages the member may open
 * @param {number} slots - Slot count
 * @return {NavigationItem[]} - One page per slot while enough exist
 */

export const resolveDock = (
  saved: readonly string[],
  candidates: NavigationItem[],
  slots: number
): NavigationItem[] => {
  const byHref = new Map(candidates.map((item) => [item.href, item]))
  const wanted = Array.from({ length: slots }, (_, index) => saved[index] || DOCK_DEFAULTS[index])
  const spare = [...DOCK_DEFAULTS, ...DOCK_FALLBACKS, ...candidates.map((item) => item.href)]

  // A page wanted by a later slot is never borrowed by an earlier one
  const reserved = new Set(wanted.filter((href) => href && byHref.has(href)))
  const used = new Set<string>()

  return wanted.flatMap((href) => {
    const isOpen = Boolean(href) && byHref.has(href) && !used.has(href)
    const picked = isOpen
      ? href
      : spare.find(
          (candidate) => byHref.has(candidate) && !used.has(candidate) && !reserved.has(candidate)
        )
    if (!picked) return []

    used.add(picked)

    return [byHref.get(picked)!]
  })
}

/**
 * Whether a path may be stored as a dock pick
 * @param {string} path - Stored path
 * @param {NavigationGroup[]} navigation - Every rail group
 * @return {boolean} - Known destination
 */

export const isDockPath = (path: string, navigation: NavigationGroup[]): boolean =>
  path !== DOCK_HOME_PATH &&
  navigation.flatMap((group) => group.items).some((item) => item.href === path)

/**
 * Dock pages split around Home, the menu closing the right side
 * @param {NavigationItem[]} slots - Pages in slot order
 * @return {{ left: NavigationItem[], right: NavigationItem[] }} - Pages left and right of Home
 */

export const splitDock = (
  slots: NavigationItem[]
): { left: NavigationItem[]; right: NavigationItem[] } => {
  const leftCount = Math.ceil((slots.length + 1) / 2)

  return { left: slots.slice(0, leftCount), right: slots.slice(leftCount) }
}
