/**
 * Notebook hub: its class and the words written on its lines
 * @type {Object}
 */

export const PLAY_PAPER = {
  ground: 'play-paper',
  // Squares kept clear on the left of the margin line
  marginSquares: 4,
  // Middle of the page kept clear for the menu, share of its width and height
  clear: { width: 0.54, height: 0.64 },
  // Squares a letter takes
  squaresPerLetter: 0.55,
  // Pen drift in degrees
  tilt: 1.6,
  // Tries to find a free spot before resting
  attempts: 12,
  // Share of words written with a mistake
  typoRate: 0.35,
  // Pen pace in ms: a letter, a mistake spotted, the finished word, a letter wiped, the blank page
  pace: { write: 120, notice: 800, hold: 2400, erase: 40, rest: 700 },
  words: [
    'Zèbre',
    'Paris',
    'Anaïs',
    'Mexique',
    'Cerise',
    'Boulanger',
    'Tigre',
    'Lima',
    'Hugo',
    'Japon',
    'Pomme',
    'Pilote',
    'Koala',
    'Rome',
    'Léa',
    'Brésil',
    'Kiwi',
    'Docteur',
    'Loutre',
    'Oslo',
    'Noé',
    'Chili',
    'Mangue',
    'Avocat',
    'Renard',
    'Nice',
    'Jade',
    'Kenya',
    'Poire',
    'Plombier',
    'Girafe',
    'Lyon',
    'Théo',
    'Inde',
    'Banane',
    'Pompier',
    'Dauphin',
    'Tokyo',
    'Manon',
    'Cuba',
    'Orange',
    'Chanteur',
    'Panda',
    'Séoul',
    'Eliott',
    'Ghana',
    'Citron',
    'Peintre',
  ],
} as const
