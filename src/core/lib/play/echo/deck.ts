/**
 * Card of the deck
 * @typedef {number[]} EchoCard
 */

export type EchoCard = number[]

/**
 * Deck where any two cards share exactly one symbol (projective plane, prime order)
 * @param {number} order - Prime order, symbols per card minus one
 * @return {EchoCard[]} - Cards of symbol ids
 */

export const buildDeck = (order: number): EchoCard[] => {
  const cards: EchoCard[] = [Array.from({ length: order + 1 }, (_, index) => index)]
  const spot = (column: number, shift: number) => order + 1 + column * order + (shift % order)

  // Cards through the first symbol
  for (let line = 0; line < order; line += 1) {
    cards.push([0, ...Array.from({ length: order }, (_, column) => spot(line, column))])
  }

  // Remaining cards, one per slope and offset
  for (let slope = 0; slope < order; slope += 1) {
    for (let offset = 0; offset < order; offset += 1) {
      cards.push([
        slope + 1,
        ...Array.from({ length: order }, (_, column) => spot(column, slope * column + offset)),
      ])
    }
  }

  return cards
}

/**
 * Symbol two cards have in common
 * @param {EchoCard} left - Card
 * @param {EchoCard} right - Card
 * @return {number} - Symbol id, -1 when none
 */

export const commonSymbol = (left: EchoCard, right: EchoCard): number =>
  left.find((symbol) => right.includes(symbol)) ?? -1
