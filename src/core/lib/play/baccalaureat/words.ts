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

/**
 * Answers sharing a word inside a category
 * @param {{ id: string, category: string, word: string }[]} answers - Answers compared
 * @return {Set<string>} - Ids written twice
 */

export const sharedAnswerIds = (
  answers: { id: string; category: string; word: string }[]
): Set<string> => {
  const groups = Map.groupBy(
    answers,
    (answer) => `${answer.category}:${normalizeWord(answer.word)}`
  )

  return new Set(
    [...groups.values()]
      .filter((group) => group.length > 1)
      .flatMap((group) => group.map((a) => a.id))
  )
}
