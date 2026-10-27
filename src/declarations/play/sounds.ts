// Sound folder, credits in CREDITS.md
const EFFECTS = '/play/sons/effets'

/**
 * Sounds of the count before a game
 * @type {Record<string, string>}
 */

export const PLAY_COUNTDOWN_SOUNDS = {
  tick: `${EFFECTS}/decompte.mp3`,
  go: `${EFFECTS}/depart.mp3`,
} as const
