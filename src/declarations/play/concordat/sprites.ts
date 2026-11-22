import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

/**
 * Pixel sprites of the moving units, facing right: '.' is empty, 'h' the nation colour, 'd' its shade, 'l' its light
 * @typedef {string} ConcordatSpriteName
 */

export type ConcordatSpriteName =
  'trade' | 'transport' | 'war' | 'missile' | 'heavy' | 'fighter' | 'heli' | ConcordatBuildingKind

// Fixed colours of the sprite pixels
export const CONCORDAT_SPRITE_INK: Record<string, readonly number[]> = {
  k: [34, 42, 50],
  w: [246, 248, 250],
  g: [150, 160, 168],
  G: [96, 106, 116],
  y: [200, 168, 120],
  r: [74, 66, 60],
  f: [232, 92, 74],
  R: [196, 56, 52],
  o: [255, 178, 40],
  c: [255, 246, 200],
}

/**
 * Pixel grids: boats, train, missiles, aircraft and one house per building kind
 * @type {Record<ConcordatSpriteName, string[]>}
 */

export const CONCORDAT_SPRITES: Record<ConcordatSpriteName, string[]> = {
  trade: ['.h.', 'hlh', '.h.'],
  transport: ['..........', '.yy.yy.k..', '.yy.yy.kk.', 'kkkkkkkkkk', '.hhhhhhhhh', '..ddddddd.'],
  war: [
    '.........k.........',
    '....kk...k..kk......',
    '...kGGk.kgk.kGGk....',
    '.kkkkkkkkkkkkkkkkk..',
    'kggggggggggggggggg..',
    '.gggghhhhhhhgggggggk',
    '..GGGGGGGGGGGGGGGk..',
    '...GGGGGGGGGGGGG....',
  ],
  missile: ['...k........', '.fkRwwwwwk..', 'ocfRwwwwwwkk', '.fkRwwwwwk..', '...k........'],
  heavy: [
    '....kk..........',
    '..fkRRkgggggk...',
    '.ofkRggggggggk..',
    'ocfRggggggggggkk',
    '.ofkRggggggggk..',
    '..fkRRkgggggk...',
    '....kk..........',
  ],
  fighter: [
    '.....kk......',
    '....kdhk.....',
    '...kdhhhk....',
    '.kkkhhhhhkk..',
    'kdhhhhhhhhhwk',
    '.kkkhhhhhkk..',
    '...kdhhhk....',
    '....kdhk.....',
    '.....kk......',
  ],
  heli: ['....kkkk....', 'k.kkhhhhkk..', 'kkkhhhhhhwwk', 'k.kkhhhhkk..', '....kkkk....'],
  market: [
    '.........',
    '.kkkkkkk.',
    'kdhdhdhdk',
    'kdhdhdhdk',
    'kkkkkkkkk',
    '.kr...rk.',
    '.kr.y.rk.',
    '.kr.y.rk.',
    '.kkkkkkk.',
  ],
  barracks: [
    '....kf...',
    '....kff..',
    '....k....',
    '...khk...',
    '..khhhk..',
    '.khhdhhk.',
    'khhhdhhhk',
    'kkkkkkkkk',
    '.........',
  ],
  port: [
    '....k....',
    '...khk...',
    '....k....',
    '..kkkkk..',
    '....k....',
    'k...k...k',
    'kk..k..kk',
    '.kkkkkkk.',
    '...kkk...',
  ],
  silo: [
    '....k....',
    '...kRk...',
    '..kwwwk..',
    '..kwwwk..',
    '..kwhwk..',
    '.kkwhwkk.',
    'kgggggggk',
    'kkkkkkkkk',
    '.........',
  ],
  post: [
    '.kkkkkkk.',
    'khhhhhhhk',
    'kkkkkkkkk',
    '..krrrk..',
    '..krwrk..',
    '..krrrk..',
    '..krrrk..',
    '.kkkkkkk.',
    '.........',
  ],
  sam: [
    '......kR.',
    '.....kRk.',
    '....kwk..',
    '...kwk...',
    '..khk....',
    '.khhhkkk.',
    'khhhhhhhk',
    'kggkggkgk',
    '.kk.kk.kk',
  ],
  airbase: [
    '......kkk',
    '......khk',
    'kkkkkkkkk',
    'kgggggggk',
    'kgwgwgwgk',
    'kgggggggk',
    'kkkkkkkkk',
    '.........',
    '.........',
  ],
  battery: [
    '.........',
    '.....kkkk',
    '..kkkkgGk',
    '.khhhhkkk',
    '.khhhhhk.',
    'khhhhhhhk',
    'kdddddddk',
    'kkkkkkkkk',
    '.........',
  ],
  factory: [
    '.g...g...',
    '.kk..kk..',
    '.khk.khk.',
    'kkhkkkhkk',
    'khhhhhhhk',
    'khlkhlkhk',
    'khhhhhhhk',
    'kkkkkkkkk',
    '.........',
  ],
}
