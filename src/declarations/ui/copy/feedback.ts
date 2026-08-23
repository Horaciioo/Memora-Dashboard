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
 * Named toast, its emphasis marking the verb to bold
 * @typedef {Object} FeedbackTitle
 * @property {string} title - Full sentence
 * @property {string} emphasis - Substring rendered bold
 */

export interface FeedbackTitle {
  title: string
  emphasis: string
}

/**
 * Verb forms, singular and plural, by gender
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
 * Named feedback toast, the record's name quoted when known
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
