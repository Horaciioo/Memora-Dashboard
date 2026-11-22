/**
 * Rank band of a level
 * @typedef {Object} PlayTier
 * @property {string} label - Band name
 * @property {number} from - First level
 * @property {string} tone - Colour token
 */

export interface PlayTier {
  label: string
  from: number
  tone: string
}

/**
 * Bands of the level ladder, lowest first
 * @type {PlayTier[]}
 */

export const PLAY_TIERS: PlayTier[] = [
  { label: 'Découverte', from: 1, tone: '--play-tier-discovery' },
  { label: 'En progression', from: 10, tone: '--play-tier-progress' },
  { label: 'Maîtrisé', from: 30, tone: '--play-tier-mastered' },
  { label: 'Expert', from: 60, tone: '--play-tier-expert' },
  { label: 'Légendaire', from: 100, tone: '--play-tier-legend' },
]

/**
 * Band of a level and the next one
 * @param {number} level - Level
 * @return {{ tier: PlayTier, next: PlayTier | null }} - Current and next band
 */

export const tierOf = (level: number): { tier: PlayTier; next: PlayTier | null } => {
  const index = PLAY_TIERS.filter((tier) => level >= tier.from).length - 1

  return { tier: PLAY_TIERS[Math.max(0, index)], next: PLAY_TIERS[index + 1] ?? null }
}

/**
 * Box announcing the trophy system rework
 * @type {Record<string, string>}
 */

export const PLAY_LEVEL_NOTICE = {
  title: 'Refonte du système de trophées !',
  text: 'Les jeux rapportent désormais 5 fois plus d’XP. Ton XP de jeu passée a été multipliée par 5 : voilà ce que ça te rapporte.',
  level: 'niveau gagné',
  levels: 'niveaux gagnés',
  xp: 'XP en plus',
  factor: 'd’XP par partie',
  confirm: 'Super',
} as const

/**
 * Box announcing the trophies paid back
 * @type {Record<string, string>}
 */

export const PLAY_TROPHY_NOTICE = {
  title: 'Changement sur les trophées',
  text: 'Tes trophées sont désormais payés en XP et en niveaux. Voilà ce que ça te rapporte.',
  xp: 'XP',
  trophy: 'trophée',
  trophies: 'trophées',
  level: 'niveau',
  levels: 'niveaux',
  confirm: 'Super',
} as const
