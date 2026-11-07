import { PLAY_SETTINGS } from '@/declarations/play/settings'

// No 0, O, 1, I, L to read aloud
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Short code opening a private game
 * @param {() => number} [random] - Random source
 * @return {string} - Code
 */

export const makeJoinCode = (random: () => number = Math.random): string =>
  Array.from(
    { length: PLAY_SETTINGS.privateGames.codeLength },
    () => ALPHABET[Math.floor(random() * ALPHABET.length)]
  ).join('')

/**
 * Code as typed or pasted
 * @param {string} raw - Typed text
 * @return {string} - Clean code
 */

export const cleanJoinCode = (raw: string): string => raw.replace(/\s+/g, '').toUpperCase()
