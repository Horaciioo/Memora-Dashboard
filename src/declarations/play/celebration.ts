import { PLAY_END_TIMING } from '@/declarations/play/end'

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
  // Trophies of the end page cheer once their card is on screen
  trophyDelayMs: PLAY_END_TIMING.card + 900,
  trophyStepMs: 4600,
  // Sparks around the quest seal
  sparks: 14,
  // Rings of the level shockwave
  waves: 3,
} as const
