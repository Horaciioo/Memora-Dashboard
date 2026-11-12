import type { UnbanFormSnapshot } from '@/declarations/unban/form'

/**
 * Version of the Deban. form
 * @typedef {Object} UnbanFormVersionView
 * @property {string} id - Version identifier
 * @property {number} number - Version number
 * @property {UnbanFormSnapshot} snapshot - Questions as frozen
 * @property {string | null} publishedAt - ISO publication, null for the draft
 */

export interface UnbanFormVersionView {
  id: string
  number: number
  snapshot: UnbanFormSnapshot
  publishedAt: string | null
}
