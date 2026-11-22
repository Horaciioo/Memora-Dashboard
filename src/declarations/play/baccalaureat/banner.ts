/**
 * Seyès exam sheet of the Baccalauréat hub, card and tile
 * @type {object}
 */

export const BAC_BANNER = {
  // Big ruling, small rulings inside, red margin
  ruling: 32,
  margin: 150,
  categories: ['Pays', 'Animal', 'Prénom', 'Métier', 'Fruit'],
  // Rows of the round, one letter each
  rows: [
    { letter: 'B', y: 224, words: ['Belgique', 'Baleine', 'Bastien', 'Boulanger', 'Banane'] },
    { letter: 'M', y: 736, words: ['Maroc', 'Mouton', 'Margot', 'Médecin', 'Mangue'] },
  ],
  // Word crossed out then rewritten
  crossed: { row: 1, column: 4, fix: 'Myrtille' },
  header: 128,
  columnStart: 230,
  columnStep: 270,
  // Seconds of one sheet, and the pen speed per word
  cycle: 22,
  write: 0.9,
  card: {
    letter: 'B',
    words: ['Belgique', 'Baleine', 'Bastien'],
    fontSize: 30,
    margin: 70,
  },
} as const
