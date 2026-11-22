import { PIXEL_LETTERS } from '@/declarations/play/pixelArt'

/**
 * Pixel rows of a word, one blank column between letters
 * @param {string} text - Uppercase word
 * @return {string[]} - Five rows of X and dots
 */

export const pixelWordRows = (text: string): string[] =>
  Array.from({ length: 5 }, (_, row) =>
    [...text].map((letter) => PIXEL_LETTERS[letter]?.[row] ?? PIXEL_LETTERS[' '][row]).join('.')
  )
