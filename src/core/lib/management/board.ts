import type { ManagedMember } from '@/types/management'
import { foldText } from '@/utils/format/strings'

// Filter every board shares, creators a member works for
export const YOUTUBER_FILTER = 'youtuber'

/**
 * What a board filters a row on
 * @typedef {Object} BoardMatchable
 * @property {ManagedMember} member - Whom the row concerns
 * @property {string[]} haystack - Texts the search reads, besides the member name
 * @property {Record<string, string[]>} facets - Values the row holds per filter
 */

export interface BoardMatchable {
  member: ManagedMember
  haystack: string[]
  facets: Record<string, string[]>
}

/**
 * Facets every row shares
 * @param {ManagedMember} member - Whom the row concerns
 * @return {Record<string, string[]>} - Creator facet
 */

export const memberFacets = (member: ManagedMember): Record<string, string[]> => ({
  [YOUTUBER_FILTER]: member.youtubers.map((youtuber) => youtuber.id),
})

/**
 * Tell whether a row survives the search and the filters
 * @param {BoardMatchable} row - Row under test
 * @param {string} search - Free text typed
 * @param {Record<string, string>} values - Selected value per filter, empty for none
 * @return {boolean} - Row stays on the board
 */

export const matchesBoard = (
  row: BoardMatchable,
  search: string,
  values: Record<string, string>
): boolean => {
  const term = foldText(search.trim())

  if (
    term.length > 0 &&
    ![row.member.displayName, ...row.haystack].some((text) => foldText(text).includes(term))
  ) {
    return false
  }

  return Object.entries(values).every(
    ([name, value]) => value.length === 0 || (row.facets[name]?.includes(value) ?? false)
  )
}
