import type { SanctionOffenseCard } from '@/types/sanctions'
import { SanctionGravities, SanctionKinds } from '@/utils/constants/moderation'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Bounds of the personal detections
 * @type {Record<string, number>}
 */

export const MODVIEW_PERSONAL = {
  maxRepeatWords: 5,
  maxBadwords: 30,
  maxSharedWords: 30,
  maxWordLength: 40,
  // Same line said again inside this span counts as a repeat
  repeatWindowMs: 2 * MINUTE_MS,
  // First repeat is the second time
  minRepeats: 2,
} as const

// Colour of a badword without its own
export const BADWORD_TONE = 'var(--color-danger)'

// Colour of a shared word
export const SHARED_TONE = 'var(--color-apple-orange)'

// Category of a suggestion born from a repeated line
export const REPEAT_CATEGORY = 'repeated_phrase'

/**
 * Wording of the personal detections
 * @type {Record<string, string>}
 */

export const MODVIEW_PERSONAL_COPY = {
  watchedTerms: 'Termes surveillés',
  repeatHead: 'Phrases répétées',
  repeatHint:
    'Jusqu’à {max} mots. Une ligne qui en contient un, redite par le même viewer, est comptée dans le chat.',
  repeatPlaceholder: 'Mot à surveiller',
  repeatBadge: 'x{count}',
  repeatTitle: 'Même ligne dite {count} fois',
  repeatOffense: 'Phrase dupliquée',
  badwordHead: 'Mes badwords',
  badwordHint:
    'Détection personnelle, affichée dans la file d’attente de l’AutoMod avec la couleur choisie.',
  badwordPlaceholder: 'Nouveau badword',
  add: 'Ajouter',
  listFull: 'Liste pleine',
  remove: 'Retirer {term}',
  badwordColour: 'Couleur de {term}',
  badwordSuggest: 'Suggérer une sanction',
  badwordEmpty: 'Aucun badword pour l’instant.',
  sharedHead: 'Mots partagés',
  sharedHint:
    'Visibles par toute l’équipe sur ce live, en orange dans le chat. Aucune action n’est lancée.',
  sharedPlaceholder: 'Nouveau mot partagé',
  sharedEmpty: 'Aucun mot partagé pour l’instant.',
  sharedBy: 'Ajouté par {name}',
  queueCategory: 'Mes badwords',
  queueDismiss: 'Écarter',
} as const

// Warning of the repeated phrase, when the panel has no offence of that name
const REPEAT_MEASURE = {
  id: 'repeat-warn',
  name: 'Avertissement',
  kind: SanctionKinds.Warn,
  durationMinutes: null,
  permanent: false,
  accent: null,
  weight: 1,
}

const REPEAT_RUNG = { id: 'repeat-rung', step: 0, condition: null, measures: [REPEAT_MEASURE] }

/**
 * Offence standing for a repeated phrase
 * @type {SanctionOffenseCard}
 */

export const REPEAT_OFFENSE: SanctionOffenseCard = {
  id: 'repeat-phrase',
  name: MODVIEW_PERSONAL_COPY.repeatOffense,
  gravity: SanctionGravities.Low,
  firstRung: REPEAT_RUNG,
  rungCount: 1,
  rungs: [REPEAT_RUNG],
  examples: [],
  tolerated: [],
  keywords: [],
}
