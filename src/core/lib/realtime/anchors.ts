import { PRESENCE_ANCHOR_ATTRIBUTE } from '@/declarations/system/presence'

// Separates route from anchor
const PLACE_SEPARATOR = '#'
// Separates name from occurrence
const OCCURRENCE_SEPARATOR = ':'

const anchorsNamed = (name: string): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>(`[${PRESENCE_ANCHOR_ATTRIBUTE}="${CSS.escape(name)}"]`),
]

/**
 * Anchor marking props
 * @param {string} name - Anchor name
 * @return {Record<string, string>} - Element props
 */

export const presenceAnchor = (name: string): Record<string, string> => ({
  [PRESENCE_ANCHOR_ATTRIBUTE]: name,
})

/**
 * Anchor around an element
 * @param {Element} target - Touched element
 * @return {string | null} - Anchor key
 */

export const anchorOf = (target: Element): string | null => {
  const element = target.closest<HTMLElement>(`[${PRESENCE_ANCHOR_ATTRIBUTE}]`)
  const name = element?.getAttribute(PRESENCE_ANCHOR_ATTRIBUTE)
  if (!element || !name) return null

  return `${name}${OCCURRENCE_SEPARATOR}${anchorsNamed(name).indexOf(element)}`
}

/**
 * Element of an anchor
 * @param {string} anchor - Anchor key
 * @return {HTMLElement | null} - Element
 */

export const elementOfAnchor = (anchor: string): HTMLElement | null => {
  const cut = anchor.lastIndexOf(OCCURRENCE_SEPARATOR)

  return anchorsNamed(anchor.slice(0, cut))[Number(anchor.slice(cut + 1))] ?? null
}

/**
 * Place of a route anchor
 * @param {string} pathname - Route
 * @param {string | null} anchor - Anchor key
 * @return {string} - Place
 */

export const placeOfAnchor = (pathname: string, anchor: string | null): string =>
  anchor ? `${pathname}${PLACE_SEPARATOR}${anchor}` : pathname

/**
 * Anchor of a place on a route
 * @param {string | null} place - Reported place
 * @param {string} pathname - Route on screen
 * @return {string | null} - Anchor key
 */

export const anchorOfPlace = (place: string | null, pathname: string): string | null => {
  const prefix = `${pathname}${PLACE_SEPARATOR}`

  return place?.startsWith(prefix) ? place.slice(prefix.length) : null
}
