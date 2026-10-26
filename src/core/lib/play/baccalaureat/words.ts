/**
 * Comparable form of a word
 * @param {string} word - Written word
 * @return {string} - Lowercase, unaccented, single spaced
 */

export const normalizeWord = (word: string): string =>
  word
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()

/**
 * Word opening on the round's letter
 * @param {string} word - Written word
 * @param {string} letter - Round letter
 * @return {boolean} - Fits the letter
 */

export const fitsLetter = (word: string, letter: string): boolean => {
  const written = normalizeWord(word)
  const opening = normalizeWord(letter)

  // The letter alone is no word
  return written.length > opening.length && written.startsWith(opening)
}
