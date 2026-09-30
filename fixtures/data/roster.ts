/**
 * Creator the corp works for, looked up by name so a real row is reused rather than duplicated
 * @typedef {Object} CreatorSeed
 */

export interface CreatorSeed {
  name: string
  handle: string
  accent: string
  // Colours of the generated portrait and banner
  palette: [string, string]
}

export const CREATORS: CreatorSeed[] = [
  {
    name: 'Michou',
    handle: 'twitch.tv/michou',
    accent: '#21ff9c',
    palette: ['#21ff9c', '#0b7a4b'],
  },
  {
    name: 'Inoxtag',
    handle: 'youtube.com/@inoxtag',
    accent: '#4f46e5',
    palette: ['#6366f1', '#1e1b4b'],
  },
  {
    name: 'Doigby',
    handle: 'twitch.tv/doigby',
    accent: '#f97316',
    palette: ['#fb923c', '#7c2d12'],
  },
  {
    name: 'Anthony Collette',
    handle: 'youtube.com/@anthonycollette',
    accent: '#0ea5e9',
    palette: ['#38bdf8', '#0c4a6e'],
  },
]

// Function keys
export type FunctionKey =
  'functionDiscord' | 'functionLive' | 'functionAnimator' | 'functionRecruiter' | 'functionTrainer'

/**
 * Responsable
 * @typedef {Object} ResponsableSeed
 */

export interface ResponsableSeed {
  name: string
  creator: string
  functions: FunctionKey[]
  // Seniority in days
  seniority: number
}

export const RESPONSABLES: ResponsableSeed[] = [
  {
    name: 'Procyonaa',
    creator: 'Michou',
    functions: ['functionLive', 'functionTrainer'],
    seniority: 720,
  },
  {
    name: 'Andrew',
    creator: 'Michou',
    functions: ['functionDiscord', 'functionRecruiter'],
    seniority: 610,
  },
  { name: 'Antwo', creator: 'Inoxtag', functions: ['functionLive'], seniority: 540 },
  {
    name: 'Witt',
    creator: 'Inoxtag',
    functions: ['functionDiscord', 'functionTrainer'],
    seniority: 480,
  },
  {
    name: 'Luzrod',
    creator: 'Doigby',
    functions: ['functionLive', 'functionRecruiter'],
    seniority: 400,
  },
  { name: 'Kaelys', creator: 'Doigby', functions: ['functionAnimator'], seniority: 300 },
  { name: 'Orphée', creator: 'Anthony Collette', functions: ['functionDiscord'], seniority: 260 },
]

// Second administrator, so the crown shows up beside the root one
export const CO_ADMIN = { name: 'Nébula', seniority: 800 }

// Pseudos of the moderators, one account each
export const MODERATOR_NAMES = [
  'Azuryx',
  'Brisk',
  'Caramel',
  'Dyxon',
  'Elowen',
  'Fenrir',
  'Gaïa',
  'Hakko',
  'Ilyo',
  'Jinx',
  'Kazé',
  'Lumen',
  'Mako',
  'Nyx',
  'Oskar',
  'Pixel',
  'Quartz',
  'Rayn',
  'Saphir',
  'Tidus',
  'Umbra',
  'Vesper',
  'Wasabi',
  'Xeno',
  'Yuki',
  'Zéphyr',
  'Aloha',
  'Bamboo',
  'Cosmo',
  'Draco',
  'Echo',
  'Flint',
  'Glitch',
  'Hibiki',
  'Iris',
  'Jade',
  'Kiwi',
  'Lyra',
  'Mochi',
  'Nova',
  'Onyx',
  'Pépite',
  'Quinoa',
  'Rubis',
  'Sora',
  'Tempo',
  'Ursa',
  'Volt',
  'Willow',
  'Yzzy',
  'Zinc',
  'Astro',
  'Blizz',
  'Cendre',
  'Dune',
  'Écume',
  'Frost',
  'Givre',
  'Halo',
  'Indigo',
  'Jazz',
  'Koda',
  'Lotus',
  'Mistral',
  'Nacre',
  'Opale',
  'Praline',
  'Rafale',
  'Silex',
  'Tonka',
  'Uzumi',
  'Vanille',
  'Wapiti',
  'Yoko',
  'Zazou',
  'Ambre',
  'Bulle',
  'Cumin',
]

// Pseudos of the candidates of recruitment campaigns, never given an account
export const CANDIDATE_NAMES = [
  'Arkos',
  'Belka',
  'Cyan',
  'Dahlia',
  'Ezra',
  'Falco',
  'Gemma',
  'Hugo_tv',
  'Isko',
  'Jolt',
  'Kenji',
  'Lilou',
  'Milo',
  'Neko',
  'Orion',
  'Paprika',
  'Rémi',
  'Salsa',
  'Tao',
  'Ulysse',
  'Vega',
  'Wendy',
  'Yann',
  'Zoé',
  'Axel',
  'Bastet',
  'Clover',
  'Dex',
  'Eden',
  'Fizz',
  'Goji',
  'Hana',
  'Ivy',
  'Juno',
  'Kilo',
  'Loki',
]

export const LANGUAGE_SETS = [
  ['fr'],
  ['fr', 'en'],
  ['fr', 'en', 'es'],
  ['fr', 'de'],
  ['fr', 'it'],
  ['fr', 'ar'],
]

export const TIMEZONES = [
  'Europe/Paris',
  'Europe/Paris',
  'Europe/Paris',
  'Europe/Brussels',
  'America/Montreal',
  'Europe/Zurich',
]
