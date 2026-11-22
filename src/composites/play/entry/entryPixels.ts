import { pixelWordRows } from '@/core/lib/play/pixelWord'
import { PLAY_ENTRY_STAGGER as STAGGER, PLAY_ENTRY_WORD } from '@/declarations/play/entry'
import { PIXEL_BRAIN } from '@/declarations/play/pixelArt'

// One square of the logo
export type EntryPixel = { x: number; y: number; tone: 'brain' | 'word'; shade: number }

const BRAIN_BANDS = 4
const WORD_GAP = 2

/**
 * Squares of the Memora brain with the word under it
 * @return {{ pixels: EntryPixel[], cols: number, rows: number }} - Squares and grid size
 */

export const buildEntryPixels = () => {
  const word = pixelWordRows(PLAY_ENTRY_WORD)
  const cols = PIXEL_BRAIN[0].length
  const rows = PIXEL_BRAIN.length + WORD_GAP + word.length
  const wordLeft = Math.floor((cols - word[0].length) / 2)
  const pixels: EntryPixel[] = []

  PIXEL_BRAIN.forEach((line, y) => {
    ;[...line].forEach((cell, x) => {
      if (cell !== 'X') return
      const shade = Math.min(BRAIN_BANDS - 1, Math.floor((y / PIXEL_BRAIN.length) * BRAIN_BANDS))
      pixels.push({ x, y, tone: 'brain', shade })
    })
  })

  word.forEach((line, row) => {
    ;[...line].forEach((cell, col) => {
      if (cell !== 'X') return
      pixels.push({
        x: wordLeft + col,
        y: PIXEL_BRAIN.length + WORD_GAP + row,
        tone: 'word',
        shade: row === 0 ? 0 : row === word.length - 1 ? 2 : 1,
      })
    })
  })

  return { pixels, cols, rows }
}

/**
 * Delays and flight of one square, scattered from its place
 * @param {number} x - Column
 * @param {number} y - Row
 * @return {Record<string, number | string>} - Custom properties of the square
 */

export const pixelMotion = (x: number, y: number): Record<string, number | string> => ({
  '--in': `${x * STAGGER.column + ((x * 7 + y * 13) % STAGGER.inRange) * STAGGER.inJitter}ms`,
  '--out': `${((x * 5 + y * 11) % STAGGER.outRange) * STAGGER.outStep}ms`,
  '--dx': ((x * 3 + y * 5) % STAGGER.spreadRange) - STAGGER.spread,
  '--dy': ((x * 5 + y * 3) % STAGGER.spreadRange) - STAGGER.spread,
})
