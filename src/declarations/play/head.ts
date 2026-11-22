/**
 * Line under each page title
 * @type {Record<string, string>}
 */

export const PLAY_HEAD_PAGES = {
  ranking: 'Les meilleurs joueurs, par niveau, victoires ou parties.',
  quests: 'Cinq quêtes par jour, une série et un bonus à garder.',
  trophies: 'Plus un trophée est rare, plus il rapporte de niveaux.',
  history: 'Tes dernières parties, table par table.',
  stats: 'Ta carrière, jeu après jeu.',
  live: 'Toutes les parties publiques en cours.',
  feed: 'Tes dernières parties.',
  group: 'Ton groupe d’amis et ses parties.',
  settings: 'Son, mouvement et confort de jeu.',
  profile: 'Niveau, vitrine et records.',
} as const

export type PlayHeadPage = keyof typeof PLAY_HEAD_PAGES

// Trophies a showcase holds
export const PLAY_PIN_MAX = 6

/**
 * Words of rarity, platinum and the showcase
 * @type {Record<string, string>}
 */

export const PLAY_HEAD_COPY = {
  owners: '{share} % des joueurs',
  rarityCommon: 'Commun',
  rarityRare: 'Rare',
  rarityLegendary: 'Légendaire',
  levelsOne: '+{levels} niveau',
  levelsMany: '+{levels} niveaux',
  rarityCount: '{won} / {total}',
  secretName: 'Trophée secret',
  wonOn: 'Gagné le {date}',
  progress: '{value} / {target}',
  shelfLocked: 'À découvrir',
  platinum: 'Platine',
  platinumGoal: 'Gagner tous les trophées',
  platinumLeft: '{left} trophées à gagner encore !',
  wonValue: '{won} / {total}',
  wonLabel: 'Trophées gagnés',
  pinsTitle: 'Vitrine',
  manage: 'Gérer',
  pinsEmpty: 'Aucun trophée épinglé',
  pin: 'Épingler',
  unpin: 'Retirer de la vitrine',
  pinsFull: 'Vitrine pleine',
} as const
