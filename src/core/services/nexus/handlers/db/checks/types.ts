/**
 * Inconsistency rule
 * @typedef {Object} DbCheck
 * @property {string} id - Rule name
 * @property {string} label - What it looks for
 * @property {string} fix - Command that repairs it
 * @property {() => Promise<string[]>} run - Offending identifiers
 */

export interface DbCheck {
  id: string
  label: string
  fix: string
  run: (limit: number) => Promise<string[]>
}
