import type { SearchGroup } from '@/declarations/ui/copy/navigation'

/**
 * One row of the global search
 * @typedef {Object} SearchHit
 * @property {string} id - Resource identifier
 * @property {SearchGroup} group - Resource family
 * @property {string} label - Primary line
 * @property {string} [hint] - Secondary line
 * @property {string} href - Destination
 */

export interface SearchHit {
  id: string
  group: SearchGroup
  label: string
  hint?: string
  href: string
}

/**
 * Search results grouped by family
 * @typedef {Object} SearchSection
 * @property {SearchGroup} group - Resource family
 * @property {string} label - Family label
 * @property {SearchHit[]} hits - Matching rows
 */

export interface SearchSection {
  group: SearchGroup
  label: string
  hits: SearchHit[]
}
