import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { IconName } from '@/declarations/ui/icons'
import type { Tone } from '@/declarations/ui/theme'
import type { FieldDefinition } from '@/types/forms'
import { AcademyStages, DepartureKinds, ReviewAdvices } from '@/utils/constants/hierarchy'
import type {
  AcademyStageName,
  DepartureKindName,
  ReviewAdviceName,
} from '@/utils/constants/hierarchy'

/**
 * Name of the PIM automation
 * @type {string}
 */

export const PARKOUR_NAME = 'PIM'

/**
 * Division a graduate lands in
 * @type {number}
 */

export const GRADUATE_DIVISION_RANK = 1

/**
 * How one phase reads on the junior's file
 * @typedef {Object} ParkourPhaseOption
 * @property {string} label - Phase name
 * @property {string} lead - What happens now
 * @property {Tone} tone - Colour family
 * @property {IconName} icon - Glyph
 */

export interface ParkourPhaseOption {
  label: string
  lead: string
  tone: Tone
  icon: IconName
}

/**
 * Every phase of the parkour
 * @type {Record<ParkourPhase, ParkourPhaseOption>}
 */

export const PARKOUR_PHASES: Record<ParkourPhase, ParkourPhaseOption> = {
  needsTrainer: {
    label: 'Formateur à attribuer',
    lead: 'Un Formateur doit être attribué.',
    tone: 'caution',
    icon: 'functionTrainer',
  },
  needsKickoff: {
    label: 'Début de PIM à déclarer',
    lead: 'Un Responsable déclare le début de la PIM.',
    tone: 'caution',
    icon: 'link',
  },
  awaitingInfo: {
    label: 'En attente d’infos',
    lead: 'Le Junior remplit son formulaire.',
    tone: 'info',
    icon: 'clock',
  },
  ready: {
    label: 'Prêt',
    lead: 'La PIM se lance dès que tous ont fini.',
    tone: 'success',
    icon: 'confirm',
  },
  periodOne: {
    label: 'Période 1',
    lead: 'Memora et ses formations. Bilan après {lives} lives.',
    tone: 'brand',
    icon: 'academy',
  },
  reviewOneDue: {
    label: 'Bilan de 1ère phase à faire',
    lead: 'Le Formateur remplit le bilan.',
    tone: 'warning',
    icon: 'sheet',
  },
  reviewOneSubmitted: {
    label: 'Bilan déposé',
    lead: 'Le Responsable accorde ou refuse le passage.',
    tone: 'warning',
    icon: 'pending',
  },
  periodOneDone: {
    label: 'Période 1 achevée',
    lead: 'Passage accordé. La période 2 démarre pour toute la promotion.',
    tone: 'info',
    icon: 'pending',
  },
  periodTwo: {
    label: 'Période 2',
    lead: 'Objectifs et spécialisations. Bilan après {lives} lives.',
    tone: 'brand',
    icon: 'objective',
  },
  reviewTwoDue: {
    label: 'Bilan de 2e phase à faire',
    lead: 'Le Formateur donne son avis.',
    tone: 'warning',
    icon: 'sheet',
  },
  reviewTwoSubmitted: {
    label: 'Bilan déposé',
    lead: 'Le Responsable décide.',
    tone: 'warning',
    icon: 'pending',
  },
  periodThree: {
    label: 'Période 3',
    lead: 'Dernière chance, jusqu’au {deadline}.',
    tone: 'caution',
    icon: 'clock',
  },
  finalReviewDue: {
    label: 'Bilan définitif à faire',
    lead: 'Le Formateur fait le bilan définitif.',
    tone: 'warning',
    icon: 'sheet',
  },
  finalReviewSubmitted: {
    label: 'Bilan définitif déposé',
    lead: 'Le Responsable tranche.',
    tone: 'warning',
    icon: 'pending',
  },
  graduated: {
    label: 'Officialisé',
    lead: 'PIM réussie : Modérateur, Division I.',
    tone: 'success',
    icon: 'confirm',
  },
  dismissed: {
    label: 'Destitué',
    lead: 'Fin d’aventure, données effacées.',
    tone: 'danger',
    icon: 'close',
  },
  resigned: {
    label: 'Démissionnaire',
    lead: 'Il a démissionné, données effacées.',
    tone: 'neutral',
    icon: 'close',
  },
}

/**
 * Decision buttons
 * @type {Partial<Record<AcademyStageName, Partial<Record<ReviewAdviceName, string>>>>}
 */

export const PARKOUR_DECISIONS: Partial<
  Record<AcademyStageName, Partial<Record<ReviewAdviceName, string>>>
> = {
  [AcademyStages.ReviewOne]: {
    [ReviewAdvices.Pass]: 'Passage accordé',
    [ReviewAdvices.Stop]: 'Passage refusé',
  },
  [AcademyStages.ReviewFinal]: {
    [ReviewAdvices.Pass]: 'Officialiser',
    [ReviewAdvices.Bonus]: 'Accorder une 3e période',
    [ReviewAdvices.Stop]: 'Refuser',
  },
  [AcademyStages.Bonus]: {
    [ReviewAdvices.Pass]: 'Officialiser',
    [ReviewAdvices.Stop]: 'Fin d’aventure',
  },
}

/**
 * What confirming each decision says
 * @type {Record<ReviewAdviceName, string>}
 */

export const PARKOUR_DECISION_CONFIRM: Record<ReviewAdviceName, string> = {
  [ReviewAdvices.Pass]: 'Le Junior passe à la suite de son parcours.',
  [ReviewAdvices.Bonus]: 'Une 3e période s’ouvre, jusqu’à la date que tu fixes.',
  [ReviewAdvices.Stop]:
    'Le Junior est destitué : ses données personnelles sont effacées pour toujours et une annonce de départ t’attend dans tes tâches.',
}

/**
 * Copy of the parkour surfaces
 * @type {Record<string, string>}
 */

export const PARKOUR_COPY = {
  title: PARKOUR_NAME,
  assignTrainer: 'Attribuer un Formateur',
  declareKickoff: 'Déclarer le début de la PIM',
  kickoffDeclared: 'Début de PIM déclaré',
  integrationLink: 'Lien d’intégration',
  launchAnyway: 'Lancer la PIM quand même',
  launchAnywayHint:
    'Seuls les Juniors qui ont fini leur formulaire partent. Les autres partent dès qu’ils ont fini.',
  launched: 'PIM lancée',
  openSecondPeriod: 'Lancer la période 2',
  openSecondPeriodHint: 'Ouvre la période 2 pour tous les Juniors dont le passage est accordé.',
  secondPeriodOpened: 'Période 2 lancée',
  submitFirst: 'Bilan de 1ère phase réalisé',
  submit: 'Déposer le bilan',
  submitIncomplete: 'Remplis le compte rendu et note chaque compétence avant de déposer le bilan.',
  bounce: 'Renvoyer au Formateur',
  decided: 'Décision enregistrée',
  deadline: 'Date limite de la 3e période',
  deadlineHint: 'Le bilan définitif tombe ce jour-là.',
  deadlineInvalid: 'Choisis une date entre {min} et {max} jours.',
  resign: 'Enregistrer sa démission',
  resignTitle: 'Enregistrer la démission ?',
  resignDescription:
    'Tout ce qu’il a en cours est annulé et ses données personnelles sont effacées pour toujours.',
  resigned: 'Démission enregistrée',
  lives: 'Lives où il était présent',
  livesOf: '{count} / {needed}',
  kickoffPending: 'Ton début de PIM n’a pas encore été déclaré. Ton Responsable te préviendra.',
  launchNobodyReady: 'Aucun Junior n’a fini son formulaire.',
  reviewDueTitle: 'Bilan de {name}',
  doReviews: 'Réaliser mes bilans',
  depositVerb: 'Déposer',
  skillsPanel: 'Compétences',
  doDecisions: 'Donner mes décisions',
  reviewFlowTitle: 'Bilan de {name}',
  decisionFlowTitle: 'Décision pour {name}',
  flowStep: '{index} sur {total}',
  reviewsDeskTitle: 'Mes bilans',
  decisionsDeskTitle: 'Mes décisions',
  reviewsDeskEmpty: 'Aucun bilan à réaliser pour le moment.',
  decisionsDeskEmpty: 'Aucune décision n’attend.',
  reviewsPending: (count: number) =>
    `${count} ${count > 1 ? 'bilans à réaliser' : 'bilan à réaliser'}`,
  decisionsPending: (count: number) =>
    `${count} ${count > 1 ? 'décisions à donner' : 'décision à donner'}`,
  skillsLead: 'Note chaque compétence avant de déposer le bilan.',
} as const

/**
 * Copy of a member whose data was erased
 * @type {Record<string, string>}
 */

export const ERASED_COPY = {
  value: 'Données effacées',
  notice:
    'Conformément à la loi et à la protection des données des modérateurs démissionnaires, toutes les informations dites personnelles, précédemment consenties lors de son aventure, ont été effacées de la base de donnée et ne peuvent plus être récupérées, même avec accord dudit concerné.',
} as const

/**
 * Departure announcement template per kind
 * @type {Record<DepartureKindName, string>}
 */

export const DEPARTURE_TEMPLATES: Record<DepartureKindName, string> = {
  [DepartureKinds.Dismissal]: `# Départ de {username}
**{username}** (\`{identifiant}\`) {verbe} de ses fonctions de {fonction}. {emoji}

Nous remercions sincèrement **{username}** pour l’investissement donné tout ce temps et lui souhaitons une bonne continuation.`,
  [DepartureKinds.Resignation]: `# Départ de {username}
**{username}** (\`{identifiant}\`) {verbe} de ses fonctions de {fonction}. {emoji}

Nous remercions **{username}** pour son temps, ainsi que ses mois passés à nos côtés, et lui souhaitons une bonne continuation pour la suite.`,
}

/**
 * Verb of the announcement
 * @type {Record<DepartureKindName, string>}
 */

export const DEPARTURE_VERBS: Record<DepartureKindName, string> = {
  [DepartureKinds.Dismissal]: 'a été destitué·e',
  [DepartureKinds.Resignation]: 'a décidé de démissionner',
}

/**
 * Emoji of the announcement
 * @type {Readonly<Record<string, string>>}
 */

export const DEPARTURE_EMOJIS: Readonly<Record<string, string>> = {
  Discord: '⚔️',
  Lives: '🔨',
  Animateurs: '🎉',
}

/**
 * Copy of the departure task
 * @type {Record<string, string>}
 */

export const DEPARTURE_COPY = {
  task: 'Annoncer le départ de {name}',
  description:
    'L’annonce est rédigée : relis-la, copie-la, publie-la, puis marque-la comme publiée.',
  copy: 'Copier l’annonce',
  copied: 'Annonce copiée',
  publish: 'Marquer comme publiée',
  published: 'Annonce publiée',
} as const

/**
 * Declarations of the third period decision
 * @type {FieldDefinition[]}
 */

export const THIRD_PERIOD_FIELDS: FieldDefinition[] = [
  {
    name: 'deadlineAt',
    kind: 'date',
    label: PARKOUR_COPY.deadline,
    hint: PARKOUR_COPY.deadlineHint,
    required: true,
  },
  {
    name: 'decisionNote',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.decisionNote,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]
