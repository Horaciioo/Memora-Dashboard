import { NAVIGATION, ROUTES } from '@/declarations/navigation'

// Attribute read by the bubbles
export const BEACON_ATTRIBUTE = 'data-beacon'

// Marks a page still loading
export const LOADING_SELECTOR = '.skeleton-shimmer'

// Attribution reads
export const HOP_ATTRIBUTE = 'data-beacon-hop'

/**
 * Attributes making an element a beacon
 * @param {string} name - Beacon name
 * @return {Record<string, string>} - Attributes to spread
 */

export const beaconProps = (name: string): Record<string, string> => ({ [BEACON_ATTRIBUTE]: name })

/**
 * Beacon of a rail entry
 * @param {string} href - Entry address
 * @return {string} - Beacon name
 */

export const routeBeacon = (href: string): string => `route:${href}`

// Fallback aim
export const HOME_BEACON = routeBeacon(ROUTES.dashboard)

// Rail entries by length
const RAIL_HREFS = NAVIGATION.flatMap((group) => group.items.map((item) => item.href)).sort(
  (left, right) => right.length - left.length
)

/**
 * Rail entry holding a path
 * @param {string | null} href - Opened page
 * @return {string} - Beacon aimed at
 */

export const beaconOf = (href: string | null): string => {
  if (!href) return HOME_BEACON

  const path = href.split('?')[0] ?? href
  const entry = RAIL_HREFS.find(
    (candidate) => path === candidate || path.startsWith(`${candidate}/`)
  )

  return entry ? routeBeacon(entry) : HOME_BEACON
}
