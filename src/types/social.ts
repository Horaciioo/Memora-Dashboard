/**
 * Verdict of an account lookup
 * @type {'found' | 'missing' | 'unknown'}
 */

export type HandleVerdict = 'found' | 'missing' | 'unknown'

/**
 * Account a lookup turned up
 * @typedef {Object} HandleMatch
 * @property {string} handle - Handle to store
 * @property {string} label - Name the profile goes by
 */

export interface HandleMatch {
  handle: string
  label: string
}

/**
 * Answer of an account lookup
 * @typedef {Object} HandleLookupResult
 * @property {HandleVerdict} verdict - Found
 * @property {HandleMatch[]} matches - Accounts to pick from
 */

export interface HandleLookupResult {
  verdict: HandleVerdict
  matches: HandleMatch[]
}
