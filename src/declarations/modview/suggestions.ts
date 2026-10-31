// Category used for a flagged chat line
export const CHAT_FLAG_CATEGORY = 'blocked_term'

/**
 * Words too common to tell two offences apart
 * @type {Set<string>}
 */

export const COMMON_WORDS = new Set([
  'les',
  'des',
  'une',
  'que',
  'qui',
  'pas',
  'pour',
  'dans',
  'sur',
  'avec',
  'est',
  'sont',
  'mon',
  'ton',
  'son',
  'ces',
  'tes',
  'mes',
  'ses',
  'vous',
  'nous',
  'tout',
  'plus',
  'mais',
  'comme',
  'creator',
  'viewer',
  'the',
  'you',
  'and',
])

// Letters two words share to count as the same word, so plurals and conjugations match
export const WORD_STEM = 5

// Weight of a word of the offence name against one of its examples
export const NAME_WEIGHT = 2

// Shortest case compared as a phrase
export const MIN_PHRASE = 4

// Weight of a whole example said again
export const PHRASE_WEIGHT = 4

/**
 * Copy of the Suggestion window
 * @type {Record<string, string>}
 */

export const MODVIEW_SUGGESTION_COPY = {
  title: 'Suggestion',
  emptyShort: 'Rien à proposer pour l’instant.',
  emptyTitle: 'Rien à proposer pour l’instant',
  emptyBody:
    'Quand l’AutoMod retient un message, Memora écrit ici la commande prête à coller, avec le bon pseudo et la bonne raison.',
  step: 'Palier {n} / {total}',
  link: ':',
  level: 'Livecon {level}',
  accept: 'Accepter',
  refuse: 'Refuser',
  paste: 'Mettre dans le chat',
  delete: 'Supprimer le message',
  deny: 'Refuser le message',
  dismiss: 'Écarter',
  noCommand: 'Ce palier se règle sans commande : supprime le message.',
  fromAutomod: 'AutoMod',
  fromChat: 'Chat',
  watch: 'Surveiller',
  dossier: 'Dossier',
} as const

// Long measure words and their short forms
const MEASURE_SHORT: [RegExp, string][] = [
  [/avertissement/i, 'Averto'],
  [/bannissement/i, 'Ban.'],
  [/définitif/i, 'Déf'],
]

/**
 * Short measure name
 * @param {string} name - Measure name
 * @return {string} - Short name
 */

export const shortMeasure = (name: string): string =>
  MEASURE_SHORT.reduce((short, [word, replacement]) => short.replace(word, replacement), name)
