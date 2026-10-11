import { EMOJI_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Glyph of a new work item
 * @param {string | null} picked - Glyph the member chose
 * @return {string | null} - The choice, or one drawn at random
 */

export const emojiOrRandom = (picked: string | null): string | null => {
  if (picked) return picked

  const pool = EMOJI_SETTINGS.suggestions
  if (pool.length === 0) return null

  return pool[Math.floor(Math.random() * pool.length)]
}
