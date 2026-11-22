/**
 * What a group quest counts
 * @type {Record<string, string>}
 */

export const PlayGroupQuestKinds = {
  Together: 'together',
  Words: 'words',
  Wins: 'wins',
  Played: 'played',
} as const

export type PlayGroupQuestKind = (typeof PlayGroupQuestKinds)[keyof typeof PlayGroupQuestKinds]

/**
 * One quest the host can open: counted from its start, paid to the members present then
 * @typedef {Object} PlayGroupQuestTemplate
 */

export interface PlayGroupQuestTemplate {
  key: string
  kind: PlayGroupQuestKind
  target: number
  xp: number
  title: string
  hint: string
}

const { Together, Words, Wins, Played } = PlayGroupQuestKinds

// Together asks a table shared by two members at least, the others add up each member's feats
export const PLAY_GROUP_QUESTS: PlayGroupQuestTemplate[] = [
  {
    key: 'together1',
    kind: Together,
    target: 10,
    xp: 600,
    title: '10 parties ensemble',
    hint: 'Termine une partie à la même table, à deux membres ou plus.',
  },
  {
    key: 'together3',
    kind: Together,
    target: 30,
    xp: 1500,
    title: '30 parties ensemble',
    hint: 'Termine trois parties à la même table, à deux membres ou plus.',
  },
  {
    key: 'words500',
    kind: Words,
    target: 5000,
    xp: 2000,
    title: '5000 mots au Baccalauréat',
    hint: 'Les mots validés de chaque membre s’additionnent.',
  },
  {
    key: 'wins10',
    kind: Wins,
    target: 100,
    xp: 1200,
    title: '100 victoires à plusieurs',
    hint: 'Les victoires de chaque membre s’additionnent, tous jeux confondus.',
  },
  {
    key: 'played20',
    kind: Played,
    target: 200,
    xp: 1000,
    title: '200 parties terminées',
    hint: 'Les parties de chaque membre s’additionnent, tous jeux confondus.',
  },
]

/**
 * Boost a finished quest gives each member present at its start
 * @type {Record<string, number>}
 */

export const PLAY_GROUP_QUEST_BOOST = {
  // Extra share on every XP earned in Play
  percent: 25,
  hours: 24,
} as const

/**
 * Template of a key
 * @param {string} key - Template key
 * @return {PlayGroupQuestTemplate | undefined} - Template
 */

export const groupQuestOf = (key: string): PlayGroupQuestTemplate | undefined =>
  PLAY_GROUP_QUESTS.find((template) => template.key === key)

/**
 * Words of the group quest box
 * @type {Record<string, string>}
 */

export const PLAY_GROUP_QUEST_COPY = {
  title: 'Quêtes',
  none: 'Aucune quête en cours.',
  pick: 'Choisis une quête pour le groupe.',
  waitHost: 'L’hôte choisit la prochaine quête.',
  start: 'Lancer',
  next: 'Nouvelle quête',
  done: 'Quête terminée',
  reward: '+{xp} XP chacun',
  progress: '{done} / {target}',
  rule: 'Seuls comptent les membres présents au lancement.',
  late: 'Arrivé après le lancement, tu ne comptes pas pour cette quête.',
  startFailed: 'La quête n’a pas pu être lancée.',
  members: 'Prouesses',
  boostReward: '+{percent} % d’XP pendant {hours} h',
  cheer: 'Bien joué !',
  cheerBody: 'L’ensemble du groupe gagne {percent} % d’XP en plus pendant {hours} heures !',
  system: 'Memora',
} as const
