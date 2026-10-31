import type { CandidateSort } from '@/core/lib/recruitment/candidateList'

/**
 * Copy of the recruitment space
 * @type {Record<string, string>}
 */

export const RECRUITMENT_COPY = {
  title: 'Recrutements',
  heroDescription: 'Les futures recrues & leurs suivis',
  lead: 'Une session par créateur et par fonction. L’annonce part dehors, les entretiens se tiennent sur Discord, tout ce qui compte se garde ici.',
  add: 'Ouvrir une session',
  groupOpen: 'En cours',
  opensOn: 'Ouverte le {date}',
  closesOn: 'Jusqu’au {date}',
  interviewsProgress: 'Entretiens passés',
  toSchedule: 'À planifier',
  noOutcomeLegend: 'Sans statut',
  groupFinished: 'Terminées',
  addTitle: 'Ouvrir une session de recrutement',
  editTitle: 'Modifier la session',
  deleteTitle: 'Supprimer cette session ?',
  deleteDescription: 'Ses candidats, ses commentaires et sa timeline partent avec elle.',
  emptyTitle: 'Aucune session de recrutement',
  emptyDescription:
    'Ouvre une session pour un créateur et une fonction, la trame se pose toute seule.',
  filterTitle: 'Aucune session ne correspond',
  filterDescription: 'Élargis ou efface le filtre courant.',
  noYoutuber: 'Sans créateur',
  candidateCount: 'candidats',

  logPicked: 'Questionnaire des entretiens',
  logNoted: 'Prise de notes',
  logStarted: 'Entretien commencé',
  logVerdict: 'Avis rendu',
  logVerdictCleared: 'Avis retiré',
  logCommented: 'Question commentée',
  logFormal: 'Questions lues au vouvoiement',
  logInformal: 'Questions lues au tutoiement',
  logRemoved: 'Candidat retiré de la session',
  closeTitle: 'Clôturer cette session ?',
  closeDescription:
    'Attention : clôturer cette session va lancer la procédure académique. Es-tu sûr ?',
  closeConfirm: 'Oui',
  closeCancel: 'Non',
  closeRefused: 'Passe par la clôture de la session pour la clôturer.',
  closeFailed: 'La procédure a échoué pour : {names}. Réessaie, rien n’est perdu.',
  duplicateCandidate: 'Cet identifiant est déjà dans cette session.',
  logStepRemoved: 'Étape retirée de la timeline',

  informationsTitle: 'Informations',
  infoStatus: 'Statut',
  infoSessionId: 'ID de session',

  tabMe: 'Moi',
  tabInstructions: 'Consignes',
  upcomingTitle: 'Prochains entretiens',
  myInterviews: 'Mes entretiens',
  myObservations: 'Mes observations',
  myInterviewsEmpty: 'Pour le moment, tu ne disposes d\aucun entretien dans cette session.',
  myObservationsEmpty: 'Tu n’observes aucun entretien dans cette session.',
  dayToday: 'Aujourd’hui',
  dayEmpty: 'Aucun entretien aujourd’hui.',
  dayTomorrow: 'Demain',
  openQuestionnaire: 'Ouvrir le questionnaire',
  joinObservation: 'Rejoindre l’observation',
  tabCandidates: 'Candidats',
  tabQuestions: 'Questionnaire',
  tabCalendar: 'Calendrier',
  tabTimeline: 'Timeline',
  tabResults: 'Résultats',

  candidatesLead: 'Ceux qui ont passé la phase écrite, un par identifiant Discord.',
  candidateAdd: 'Ajouter un candidat',
  candidateEdit: 'Modifier le candidat',
  candidateDeleteTitle: 'Retirer ce candidat ?',
  candidateDeleteDescription: 'Son bilan et ses commentaires partent avec lui.',
  candidatesEmptyTitle: 'Aucun candidat',
  candidatesEmptyDescription:
    'Ajoute les personnes qui ont passé la phase écrite, une par identifiant Discord.',
  attended: 'Présent',
  missed: 'Absent',
  noInterview: 'Entretien non posé',
  noRecruiter: 'Sans recruteur',
  observersTitle: 'Observateurs',
  noObserver: 'Aucun observateur',
  memberLinked: 'Déjà modérateur',
  openMember: 'Ouvrir la fiche',

  calendarEmptyTitle: 'Aucun entretien posé',
  calendarEmptyDescription: 'Les entretiens apparaissent ici dès qu’une date leur est donnée.',

  attachedAcademy: 'Academy rattachée',
  instructionsPlaceholder: 'Écris ce que les recruteurs doivent savoir avant les entretiens.',
  timelineTitle: 'Timeline de la session',
  timelineLead: 'Posée depuis la trame déclarée en configuration, puis tenue à la main.',
  stepAdd: 'Ajouter une étape',
  stepEdit: 'Modifier l’étape',
  stepDone: 'Marquer faite',
  stepDoneBadge: 'Faite',
  stepUndone: 'Rouvrir',
  stepAdvanceTitle: 'Valider l’étape ?',
  stepAdvanceDescription: 'Es-tu sûr de vouloir passer à l’étape suivante ?',
  stepDeleteTitle: 'Supprimer cette étape ?',
  stepDeleteDescription: 'Elle disparaît de la timeline de cette session.',
  stepsEmptyTitle: 'Aucune étape',
  stepsEmptyDescription: 'Ajoute une étape, ou déclare une trame en configuration.',
  mandatoryBadge: 'Obligatoire',

  resultsTitle: 'Résultats',
  resultsLead: 'Chaque candidat porte un statut. Le bilan s’écrit dans sa fiche.',
  reviewTitle: 'Bilan',
  reviewEmpty: 'Aucun bilan écrit.',
  reviewEdit: 'Écrire le bilan',
  outcomesEmptyTitle: 'Aucun statut déclaré',
  outcomesEmptyDescription:
    'Les statuts sont fixés par l’équipe technique, elles arrivent au prochain déploiement.',
  noOutcome: 'Sans statut',

  instructionsTitle: 'Consignes de la session',
  instructionsLead: 'Rédigées par les responsables, propres à cette session.',
  instructionsEdit: 'Modifier les consignes',
  instructionsEmptyTitle: 'Aucune consigne',
  instructionsEmptyDescription: 'Écris ce que les recruteurs doivent savoir avant les entretiens.',
  instructionsNone: 'Aucune consigne n’a été communiquée pour le moment.',
  instructionsLocked: 'Seuls les responsables écrivent les consignes.',
} as const

/**
 * Copy of the recruitment form fields
 * @type {Record<string, string>}
 */

export const RECRUITMENT_FIELD_COPY = {
  name: 'Nom de la session',
  youtuber: 'YouTubeur',
  jobFunction: 'Fonction',
  platform: 'Plateforme',
  status: 'État',
  responsables: 'Responsables',
  recruiters: 'Recruteurs',
  observers: 'Observateurs',
  summary: 'Résumé',
  period: 'Période',
  instructions: 'Consignes',

  // Candidate fields
  discordId: 'Identifiant Discord',
  displayName: 'Pseudonyme',
  displayNameInfo:
    'Le nom sous lequel sa fiche est pré-remplie dans Modérateurs s’il est accepté. Il le confirme lui-même dans son formulaire d’intégration.',
  formId: 'Identifiant du formulaire',
  recruiter: 'Recruteur',
  observer: 'Observateur',
  interviewAt: 'Date de l’entretien',
  attended: 'Présence',
  outcome: 'Statut',
  review: 'Bilan',

  // Step fields
  prompt: 'Question',
  hint: 'Précision',

  // Timeline step fields
  title: 'Titre',
  description: 'Description',
  offset: 'Jour',
  owner: 'Responsable de l’étape',
  mandatory: 'Obligatoire',
  scheduledAt: 'Prévue le',
  notes: 'Notes',
  archived: 'Archivée',
  isDefault: 'Statut par défaut',
  isTerminal: 'Clôt le parcours',
} as const

/**
 * Copy of the recruitment filters
 * @type {Record<string, string>}
 */

export const RECRUITMENT_FILTER_COPY = {
  search: 'Rechercher une session',
  searchCandidates: 'Rechercher un candidat',
  status: 'État',
  allStatuses: 'Tous les états',
  youtuber: 'YouTubeur',
  allYoutubers: 'Tous les YouTubeurs',
  jobFunction: 'Fonction',
  allFunctions: 'Toutes les fonctions',
  outcome: 'Statut',
  allOutcomes: 'Tous les statuts',
  recruiter: 'Recruteur',
  allRecruiters: 'Tous les recruteurs',
  sort: 'Tri',
  order: 'Ordre',
  ascending: 'Croissant',
  descending: 'Décroissant',
  filterTitle: 'Aucun candidat',
  filterDescription: 'Aucun candidat ne correspond à ces filtres.',
} as const

/**
 * Labels of the candidate sorts
 * @type {Record<CandidateSort, string>}
 */

export const CANDIDATE_SORT_COPY: Record<CandidateSort, string> = {
  alphabetical: 'Ordre alphabétique',
  dateAscending: 'Entretien le plus proche',
  dateDescending: 'Entretien le plus lointain',
  discordId: 'Identifiant Discord',
}

/**
 * Glyph of each candidate sort
 * @type {Record<CandidateSort, string>}
 */

export const CANDIDATE_SORT_ICONS: Record<CandidateSort, string> = {
  alphabetical: 'alphabetical',
  dateAscending: 'meetings',
  dateDescending: 'clock',
  discordId: 'identifier',
}

/**
 * Wording of the toast naming a session
 * @type {{ label: string, gender: 'feminine' }}
 */

export const RECRUITMENT_ENTITY = { label: 'Session', gender: 'feminine' } as const

// Where the stored waiting role slips in
export const WAITING_ROLE_PLACEHOLDER = '{waitingRole}'

/**
 * Copy and layout of the weekly interview planning
 * @type {Record<string, string>}
 */

export const PLANNING_COPY = {
  previousPeriod: 'Période précédente',
  nextPeriod: 'Période suivante',
  period: 'Période affichée',
  copyText: 'Copier l’annonce',
  showAnnouncement: 'Afficher l’annonce',
  includeImage: 'Inclure l’image',
  editTitle: 'Modification',
  previewLabel: 'Aperçu',
  author: 'Memora',
  restore: 'Restaurer l’annonce générique',
  copyImage: 'Copier l’image',
  textCopied: 'Annonce copiée',
  textCopiedNext: 'Annonce copiée, colle-la puis copie l’image',
  imageCopied: 'Image copiée, colle-la sous l’annonce',
  imageFailed: 'Image impossible à copier',
  previewTitle: 'Annonce',
  periodEmpty: 'Aucun entretien sur cette période',
  waitingFallback: '@En attente de passage',
  newIdentifierTitle: 'Nouveaux identifiants',
  newIdentifierHint: 'Enregistre-les pour que les annonces affichent leur nom.',
  identifierName: 'Nom',
  identifierSave: 'Enregistrer',
  announcement: [
    `**Bonsoir à toutes et à tous** ${WAITING_ROLE_PLACEHOLDER},`,
    'Nous revenons vers vous pour vous annoncer le **Planning de la semaine**.',
    '',
    'Pensez à être présent **5 minutes avant votre entretien**.',
    'Gardez en tête que le planning peut ne pas être complet. Si vous voyez votre nom, c’est que l’horaire a été **finalisé**.',
    '',
    'Merci de respecter vos horaires !',
  ].join('\n'),
} as const

/**
 * Copy of the Moi tab figures
 * @type {Record<string, string>}
 */

export const MY_STATS_COPY = {
  title: 'Mes chiffres',
  verdicts: 'Mes décisions',
  decisions: 'avis',
  none: '0',
  empty: 'Rien à tracer pour le moment',
  interviews: 'Entretiens',
  observations: 'Observations',
  presence: 'Présence',
  choices: 'Décisions',
  duo: 'Duo',
  perDay: 'par jour',
  hoursUnit: 'h',
  noDuo: 'Pas encore de duo, il se forme dès que tu partages un entretien.',
  sessions: (count: number) => `${count} session${count > 1 ? 's' : ''}`,
  interviewsSentence: (count: number): MetricSentence => [
    'Tu as réalisé ',
    { figure: count },
    ` entretien${count > 1 ? 's' : ''} cette session`,
  ],
  observationsSentence: (count: number): MetricSentence => [
    'Tu as réalisé ',
    { figure: count },
    ` observation${count > 1 ? 's' : ''} cette session`,
  ],
  averageSentence: (value: string): MetricSentence => [
    '. En moyenne ',
    { figure: value },
    ' par jour actif',
  ],
  presenceSentence: (hours: string): MetricSentence => [
    'Tu as été présent, en moyenne approximativement ',
    { figure: hours },
    ' heures cette session',
  ],
  choicesSentence: (accepted: number, refused: number): MetricSentence => [
    'Tu as accepté ',
    { figure: accepted, tone: 'success' },
    ', et refusé ',
    { figure: refused, tone: 'danger' },
    ' candidats cette session',
  ],
  duoSentence: (partner: { label: string; image?: string | null }): MetricSentence => [
    'Ton duo préféré est avec ',
    { person: partner },
  ],
} as const

/**
 * Sentence of a metric, plain words and emphasised figures
 * @typedef {(string | { figure: string | number, tone?: 'success' | 'danger' } | { person: { label: string, image?: string | null } })[]} MetricSentence
 */

export type MetricSentence = (
  | string
  | { figure: string | number; tone?: 'success' | 'danger' }
  | { person: { label: string; image?: string | null } }
)[]
