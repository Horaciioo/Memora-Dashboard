import { PRESENCE_TINTS } from '@/declarations/system/presence'

/**
 * Stable caret colour slot of a member
 * @param {string} accountId - Account
 * @return {number} - Index in the tints
 */

export const tintOf = (accountId: string): number => {
  let hash = 0
  for (const char of accountId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0

  return hash % PRESENCE_TINTS.length
}

/**
 * Colour of a tint slot, any peer input clamped
 * @param {unknown} slot - Index sent by a peer
 * @return {string} - Colour token
 */

export const tintColor = (slot: unknown): string =>
  PRESENCE_TINTS[Number.isInteger(slot) ? Math.abs(slot as number) % PRESENCE_TINTS.length : 0] ??
  ''
