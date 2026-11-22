/**
 * Copy of the celebrations
 * @type {Record<string, string>}
 */

export const PLAY_CELEBRATION_COPY = {
  quest: 'Quête accomplie',
  questXp: '+{xp} XP',
  trophy: 'Trophée débloqué',
  level: 'Niveau supérieur',
} as const

/**
 * Timing and shape of the celebrations
 * @type {Record<string, number>}
 */

export const PLAY_CELEBRATION = {
  // Time one celebration stays up, fade included
  shownMs: 4400,
  // Trophies cheered at most per visit, the rarest first
  visitMax: 6,
  // Sparks around the quest seal
  sparks: 14,
  // Rings of the level shockwave
  waves: 3,
} as const
