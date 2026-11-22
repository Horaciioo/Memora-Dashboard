/**
 * What a quest asks of the day
 * @type {Record<string, string>}
 */

export const PlayQuestKinds = {
  Played: 'played',
  Wins: 'wins',
  Variety: 'variety',
  Podium: 'podium',
  Crowd: 'crowd',
  Private: 'private',
  Blitz: 'blitz',
  Xp: 'xp',
} as const

export type PlayQuestKind = (typeof PlayQuestKinds)[keyof typeof PlayQuestKinds]

// Slots of the day, each claimed once
export const PLAY_QUEST_SLOTS = ['main', 'side1', 'side2', 'side3', 'side4'] as const

export type PlayQuestSlot = (typeof PLAY_QUEST_SLOTS)[number]

// Claim key of the all-done bonus
export const PLAY_QUEST_BONUS_KEY = 'bonus'

// Days of history read for the streak
export const PLAY_QUEST_HISTORY_DAYS = 60

/**
 * Shape of a quest: what it asks, how much, what it pays
 * @typedef {Object} PlayQuestTemplate
 * @property {boolean} isGame - Tied to one game of the day
 */

export interface PlayQuestTemplate {
  kind: PlayQuestKind
  target: number
  xp: number
  isGame: boolean
}

const { Played, Wins, Variety, Podium, Crowd, Private, Blitz, Xp } = PlayQuestKinds

// Rewards are 10x a game's XP (play.xp)
// Main quest of the day, one of these
export const PLAY_MAIN_TEMPLATES: PlayQuestTemplate[] = [
  { kind: Wins, target: 2, xp: 600, isGame: true },
  { kind: Played, target: 3, xp: 400, isGame: true },
  { kind: Podium, target: 2, xp: 600, isGame: true },
  { kind: Variety, target: 3, xp: 600, isGame: false },
  { kind: Xp, target: 200, xp: 600, isGame: false },
]

// Side quests, four of these with different kinds
export const PLAY_SIDE_TEMPLATES: PlayQuestTemplate[] = [
  { kind: Played, target: 1, xp: 100, isGame: true },
  { kind: Wins, target: 1, xp: 200, isGame: true },
  { kind: Podium, target: 1, xp: 200, isGame: true },
  { kind: Crowd, target: 1, xp: 200, isGame: true },
  { kind: Private, target: 1, xp: 200, isGame: false },
  { kind: Blitz, target: 1, xp: 200, isGame: false },
  { kind: Xp, target: 100, xp: 200, isGame: false },
]

/**
 * Daily bonus and streak rules
 * @type {Record<string, number>}
 */

export const PLAY_QUEST_RULES = {
  // XP when every quest of the day is done
  bonusXp: 1500,
  // Share added to every reward per streak day, capped
  streakStep: 5,
  streakCap: 50,
  // Days the streak track shows
  trackDays: 7,
  // Seats at the table for a crowd or a podium
  crowdPlayers: 4,
  // Minutes under which a game is a blitz
  blitzMinutes: 10,
} as const

/**
 * Words of the quests page
 * @type {Record<string, string>}
 */

export const PLAY_QUEST_COPY = {
  pageTitle: 'Quêtes',
  main: 'Quête du jour',
  side: 'Quêtes secondaires',
  streakTitle: 'Série',
  streakDays: 'jours de suite',
  streakDay: 'jour de suite',
  streakNone: 'Joue une partie pour lancer ta série.',
  streakKeep: 'Joue aujourd’hui pour garder ta série.',
  streakSafe: 'Série tenue pour aujourd’hui.',
  streakBonus: '+{percent} % d’XP sur chaque quête',
  streakBonusNone: 'Chaque jour de série ajoute {step} % d’XP, jusqu’à {cap} %.',
  bonusTitle: 'Bonus du jour',
  bonusText: 'Termine les {total} quêtes.',
  bonusProgress: '{done} / {total}',
  progress: '{done} / {target}',
  claim: 'Récupérer',
  claimed: 'Récupérée',
  resetNote: 'Nouvelles quêtes chaque jour à minuit.',
  reward: '+{xp} XP',
  claimFailed: 'La récompense n’a pas pu être récupérée.',
} as const

/**
 * Sentence and hint of each kind, one form for a single count
 * @type {Record<PlayQuestKind, { one: string; many: string; hint?: string }>}
 */

export const PLAY_QUEST_TEXTS: Record<PlayQuestKind, { one: string; many: string; hint?: string }> =
  {
    [Played]: {
      one: 'Termine une partie de {game}',
      many: 'Termine {target} parties de {game}',
    },
    [Wins]: { one: 'Gagne une partie de {game}', many: 'Gagne {target} parties de {game}' },
    [Variety]: {
      one: 'Termine une partie',
      many: 'Termine une partie sur {target} jeux différents',
      hint: 'Change de jeu à chaque fois.',
    },
    [Podium]: {
      one: 'Monte sur le podium à {game}',
      many: 'Monte {target} fois sur le podium à {game}',
      hint: 'Parties à {players} joueurs ou plus.',
    },
    [Crowd]: {
      one: 'Termine une partie de {game} à {players} joueurs ou plus',
      many: 'Termine {target} parties de {game} à {players} joueurs ou plus',
      hint: 'Plus on est de fous.',
    },
    [Private]: {
      one: 'Termine une partie privée',
      many: 'Termine {target} parties privées',
      hint: 'Entre amis, avec un code.',
    },
    [Blitz]: {
      one: 'Termine une partie en moins de {minutes} minutes',
      many: 'Termine {target} parties en moins de {minutes} minutes',
      hint: 'Pas le temps de traîner.',
    },
    [Xp]: {
      one: 'Gagne {target} XP en parties',
      many: 'Gagne {target} XP en parties',
      hint: 'Toutes parties confondues.',
    },
  }
