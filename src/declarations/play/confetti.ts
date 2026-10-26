/**
 * Confetti thrown over the final podium
 * @type {Object}
 */

export const PLAY_CONFETTI = {
  pieces: 110,
  // Piece width in px, its height follows
  size: { min: 6, max: 11 },
  stretch: 1.7,
  // Fall time and start delay in ms
  fallMs: { min: 2600, max: 4800 },
  delayMs: { min: 0, max: 1100 },
  // Sideways drift in vw, spin in degrees
  driftVw: 18,
  spin: { min: 360, max: 1080 },
  tones: [
    '--play-baccalaureat-glow',
    '--play-gold',
    '--play-tier-legend',
    '--play-tier-progress',
    '--play-golf-glow',
    '--play-bomb-glow',
  ],
} as const
