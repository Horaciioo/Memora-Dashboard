import type { SanctionMeasureView } from '@/types/sanctions'
import { SanctionKinds } from '@/utils/constants/moderation'
import type { SanctionKindName } from '@/utils/constants/moderation'

// Chatters whose lines are never suggested nor queued
export const EXEMPT_BADGES = ['broadcaster', 'moderator', 'bot']

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

// Short label by measure kind
const MEASURE_TAG: Partial<Record<SanctionKindName, string>> = {
  [SanctionKinds.Delete]: 'Supp.',
  [SanctionKinds.Warn]: 'Warn',
  [SanctionKinds.Timeout]: 'TO',
  [SanctionKinds.Ban]: 'Ban',
}

// Duration units, largest first
const DURATION_UNITS: [number, string][] = [
  [1440, 'D'],
  [60, 'H'],
  [1, 'M'],
]

// Largest unit that divides evenly
const shortDuration = (minutes: number): string => {
  const [size, unit] = DURATION_UNITS.find(([size]) => minutes % size === 0) ?? DURATION_UNITS[2]

  return `${minutes / size}${unit}`
}

/**
 * Compact measure tag
 * @param {SanctionMeasureView} measure - Measure
 * @return {string} - Tag like TO : 7D
 */

export const measureTag = (measure: SanctionMeasureView): string => {
  const label = MEASURE_TAG[measure.kind] ?? measure.name

  return measure.durationMinutes && !measure.permanent
    ? `${label} : ${shortDuration(measure.durationMinutes)}`
    : label
}
