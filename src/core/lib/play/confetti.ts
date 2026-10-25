import { PLAY_CONFETTI } from '@/declarations/play/confetti'

/**
 * Confetti piece, as the style variables of its animation
 * @typedef {Object} ConfettiPiece
 */

export interface ConfettiPiece {
  id: number
  x: string
  width: string
  height: string
  tone: string
  duration: string
  delay: string
  drift: string
  spin: string
}

/**
 * Random number in a range
 * @param {{ min: number, max: number }} range - Bounds
 * @return {number} - Number
 */

const within = ({ min, max }: { min: number; max: number }): number =>
  min + Math.random() * (max - min)

/**
 * Pieces of one confetti burst
 * @return {ConfettiPiece[]} - Pieces
 */

export const confettiBurst = (): ConfettiPiece[] =>
  Array.from({ length: PLAY_CONFETTI.pieces }, (_, id) => {
    const width = within(PLAY_CONFETTI.size)
    const tone = PLAY_CONFETTI.tones[Math.floor(Math.random() * PLAY_CONFETTI.tones.length)]

    return {
      id,
      x: `${within({ min: 0, max: 100 }).toFixed(1)}%`,
      width: `${width.toFixed(1)}px`,
      height: `${(width * PLAY_CONFETTI.stretch).toFixed(1)}px`,
      tone: `var(${tone})`,
      duration: `${Math.round(within(PLAY_CONFETTI.fallMs))}ms`,
      delay: `${Math.round(within(PLAY_CONFETTI.delayMs))}ms`,
      drift: `${within({ min: -PLAY_CONFETTI.driftVw, max: PLAY_CONFETTI.driftVw }).toFixed(1)}vw`,
      spin: `${Math.round(within(PLAY_CONFETTI.spin) * (Math.random() < 0.5 ? -1 : 1))}deg`,
    }
  })

// Longest a burst can last, delay included
export const CONFETTI_LIFETIME_MS = PLAY_CONFETTI.fallMs.max + PLAY_CONFETTI.delayMs.max
