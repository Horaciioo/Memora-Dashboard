/**
 * Memora brain, one square per X
 * @type {string[]}
 */

export const PIXEL_BRAIN = [
  '..........XXX....XXX..........',
  '.........XXXXX..XXXXX.........',
  '.........XXXXXXXXXXXX.........',
  '.........XXXXXXXXXXXXX........',
  '......XX.XXXXXXXXXXXXXXX......',
  '.....XXXXXXXXX..XXXXXXXXX.....',
  '.....XXXX.XXX....XXX.XXXX.....',
  '.....XXX...XX....XX...XX......',
  '....XXX...XXX....XXX....XX....',
  '...XXXX...XXX....XXX...XXXX...',
  '...XXXXX..XXX....XX...XXXXX...',
  '...XXXXX...XX.........XXXXX...',
  '....XXX...XXX....XXXXXXXXXX...',
  '.........XXXXX..XXXXX....XXX..',
  '.XXXX..XXXXXXX..XXXXX....XXXX.',
  'XXXXXXXXXXXXXX..XXXX.....XXXXX',
  'XXXXXX.....XX....XX......XXXXX',
  '.XXXX.XXXX..........XXXX..XXX.',
  '..X..XXXXXX........XXXXXX..X..',
  '.....XXXXXX........XXXXXX.....',
  '.....XXXXXX........XXXXXX.....',
  '.....XXXXXX........XXXXXXX....',
  '..XXX..XXXXX......XXXXXXXXXX..',
  '.XXXXX....XXX....XXX....XXXXX.',
  '.XXXXX....XXX....XXX....XXXXX.',
  '.XXXXXXX..XXX....XXX..XXXXXXX.',
  '..XXXXXXX............XXXX.XX..',
  '.....XXXXXX.........XXXXX.....',
  '......XXXXXXX....XXXXXXX......',
  '........XXXXXX..XXXXXX........',
  '........XXXXXX..XXXXXX........',
  '........XXXXXX..XXXXXX........',
  '........XXXXX....XXXXX........',
  '..........XX......XX..........',
]

/**
 * Memora Play pad, one square per X
 * @type {string[]}
 */

export const PIXEL_PAD = [
  '..XXXXXXXXX..',
  '.XXXXXXXXXXX.',
  'XXX.XXXXXX.XX',
  'XX...XXXX.X.X',
  'XXX.XXXXXX.XX',
  'XXXXXXXXXXXXX',
  'XXXXX...XXXXX',
  '.XXX.....XXX.',
]

/**
 * Pixel letters, 5 by 5
 * @type {Record<string, string[]>}
 */

export const PIXEL_LETTERS: Record<string, string[]> = {
  M: ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'],
  E: ['XXXXX', 'X....', 'XXXX.', 'X....', 'XXXXX'],
  O: ['.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
  R: ['XXXX.', 'X...X', 'XXXX.', 'X..X.', 'X...X'],
  P: ['XXXX.', 'X...X', 'XXXX.', 'X....', 'X....'],
  L: ['X....', 'X....', 'X....', 'X....', 'XXXXX'],
  A: ['.XXX.', 'X...X', 'XXXXX', 'X...X', 'X...X'],
  Y: ['X...X', 'X...X', '.XXX.', '..X..', '..X..'],
  ' ': ['...', '...', '...', '...', '...'],
}
