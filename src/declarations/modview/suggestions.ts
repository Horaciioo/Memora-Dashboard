/**
 * Offences of the panel each AutoMod category points at, best match first
 * @type {Record<string, string[]>}
 */

export const AUTOMOD_OFFENSES: Record<string, string[]> = {
  aggression: ['Insulte grave → viewer', 'Message inapproprié', 'Grossièreté'],
  bullying: ['Participation volontaire à un harcèlement', 'Insulte grave → viewer'],
  disability: ['Message inapproprié', 'Insulte grave → viewer'],
  sexuality: ['Propos sexuels', 'Message inapproprié'],
  misogyny: ['Sexisme & machisme', 'Message inapproprié'],
  race_ethnicity_or_religion: ['Propos extrêmes', 'Message inapproprié'],
  sex_based_terms: ['Propos sexuels', 'Message inapproprié'],
  swearing: ['Grossièreté', 'Message inapproprié'],
  blocked_term: ['Message inapproprié', 'Grossièreté'],
}

// Category used for a flagged chat line
export const CHAT_FLAG_CATEGORY = 'blocked_term'

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
  noOffense: 'Aucune infraction du panel ne correspond. Choisis-la à la main.',
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
