/**
 * Generic copy for feedback surfaces
 * @type {Record<string, string>}
 */

export const FEEDBACK_COPY = {
  retry: 'Ça n’a pas marché, réessaie.',
  moved: 'Déplacé.',
  copied: 'Copié.',
  loading: 'Chargement…',
  unauthorized: 'Tu n’as pas accès à cette partie.',
} as const

/**
 * Splash screen copy
 * @type {Record<string, string>}
 */

export const SPLASH_COPY = {
  status: 'Ouverture de ton espace',
} as const

/**
 * Mutation kind driving a toast verb
 * @type {'created' | 'saved' | 'deleted'}
 */

export type FeedbackVerb = 'created' | 'saved' | 'deleted'

/**
 * Grammatical gender agreeing the verb with its entity
 * @type {'masculine' | 'feminine'}
 */

export type FeedbackGender = 'masculine' | 'feminine'

/**
 * Named toast
 * @typedef {Object} FeedbackTitle
 * @property {string} title - Full sentence
 * @property {string} emphasis - Substring rendered bold
 */

export interface FeedbackTitle {
  title: string
  emphasis: string
}

/**
 * Verb forms
 * @type {Record<FeedbackVerb, Record<FeedbackGender, Record<'singular' | 'plural', string>>>}
 */

const FEEDBACK_VERBS: Record<
  FeedbackVerb,
  Record<FeedbackGender, Record<'singular' | 'plural', string>>
> = {
  created: {
    masculine: { singular: 'créé', plural: 'créés' },
    feminine: { singular: 'créée', plural: 'créées' },
  },
  saved: {
    masculine: { singular: 'enregistré', plural: 'enregistrés' },
    feminine: { singular: 'enregistrée', plural: 'enregistrées' },
  },
  deleted: {
    masculine: { singular: 'supprimé', plural: 'supprimés' },
    feminine: { singular: 'supprimée', plural: 'supprimées' },
  },
} as const

/**
 * Named feedback toast
 * @param {string} entity - Entity label
 * @param {FeedbackVerb} verb - Mutation kind
 * @param {FeedbackGender} gender - Entity gender
 * @param {string} [name] - Record name
 * @param {boolean} [plural] - Entity stands for several records
 * @return {FeedbackTitle} - Sentence and its emphasis
 */

export const feedbackTitle = (
  entity: string,
  verb: FeedbackVerb,
  gender: FeedbackGender,
  name?: string,
  plural?: boolean
): FeedbackTitle => {
  const emphasis = FEEDBACK_VERBS[verb][gender][plural ? 'plural' : 'singular']
  const title = name ? `${entity} "${name}" ${emphasis}.` : `${entity} ${emphasis}.`

  return { title, emphasis }
}

/**
 * Toast entity
 * @typedef {Object} FeedbackEntity
 * @property {string} label - Entity label
 * @property {FeedbackGender} gender - Agreement
 */

export interface FeedbackEntity {
  label: string
  gender: FeedbackGender
}

/**
 * Toast entities
 * @type {Record<string, FeedbackEntity>}
 */

export const FEEDBACK_ENTITIES = {
  absence: { label: 'Absence', gender: 'feminine' },
  announcement: { label: 'Annonce', gender: 'feminine' },
  candidate: { label: 'Candidat', gender: 'masculine' },
  comment: { label: 'Commentaire', gender: 'masculine' },
  discordIdentifier: { label: 'Identifiant Discord', gender: 'masculine' },
  event: { label: 'Évènement', gender: 'masculine' },
  file: { label: 'Fiche', gender: 'feminine' },
  goal: { label: 'Objectif', gender: 'masculine' },
  instructions: { label: 'Consignes', gender: 'feminine' },
  junior: { label: 'Junior', gender: 'masculine' },
  live: { label: 'Live', gender: 'masculine' },
  livecon: { label: 'Livecon', gender: 'masculine' },
  member: { label: 'Modérateur', gender: 'masculine' },
  network: { label: 'Réseau', gender: 'masculine' },
  note: { label: 'Note', gender: 'feminine' },
  observer: { label: 'Observateur', gender: 'masculine' },
  permissions: { label: 'Permissions', gender: 'feminine' },
  profile: { label: 'Profil', gender: 'masculine' },
  recruitment: { label: 'Session de recrutement', gender: 'feminine' },
  review: { label: 'Bilan', gender: 'masculine' },
  session: { label: 'Session', gender: 'feminine' },
  step: { label: 'Étape', gender: 'feminine' },
  training: { label: 'Formation', gender: 'feminine' },
} as const satisfies Record<string, FeedbackEntity>

export type FeedbackEntityName = keyof typeof FEEDBACK_ENTITIES

/**
 * Toast of a known entity
 * @param {FeedbackEntityName} entity - Entity key
 * @param {FeedbackVerb} verb - Mutation kind
 * @param {string} [name] - Record name
 * @param {boolean} [plural] - Several records
 * @return {FeedbackTitle} - Sentence and its emphasis
 */

export const entityFeedback = (
  entity: FeedbackEntityName,
  verb: FeedbackVerb,
  name?: string,
  plural?: boolean
): FeedbackTitle =>
  feedbackTitle(
    FEEDBACK_ENTITIES[entity].label,
    verb,
    FEEDBACK_ENTITIES[entity].gender,
    name,
    plural
  )
