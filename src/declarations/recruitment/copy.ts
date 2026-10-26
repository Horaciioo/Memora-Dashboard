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
  noOutcomeLegend: 'Sans issue',
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
  logRemoved: 'Candidat retiré de la session',
  logStepRemoved: 'Étape retirée de la timeline',

  informationsTitle: 'Informations',
  infoStatus: 'Statut',
  infoSessionId: 'ID de session',

  tabCandidates: 'Candidats',
  tabQuestions: 'Questionnaire',
  tabCalendar: 'Calendrier',
  tabTimeline: 'Timeline',
  tabResults: 'Résultats',
  tabInstructions: 'Consignes',

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
  noRecruiter: 'Aucun recruteur',
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
  resultsLead: 'Chaque candidat porte une issue. Le bilan s’écrit dans sa fiche.',
  reviewTitle: 'Bilan',
  reviewEmpty: 'Aucun bilan écrit.',
  reviewEdit: 'Écrire le bilan',
  outcomesEmptyTitle: 'Aucune issue déclarée',
  outcomesEmptyDescription:
    'Les issues sont fixées par l’équipe technique, elles arrivent au prochain déploiement.',
  noOutcome: 'Sans issue',

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

  discordId: 'Identifiant Discord',
  displayName: 'Pseudonyme',
  displayNameInfo:
    'Le nom sous lequel sa fiche est pré-remplie dans Modérateurs s’il est accepté. Il le confirme lui-même dans son formulaire d’intégration.',
  formId: 'Identifiant du formulaire',
  recruiter: 'Recruteur',
  observer: 'Observateur',
  observerQuota: 'Entretiens observables',
  interviewAt: 'Date de l’entretien',
  attended: 'Présence',
  outcome: 'Issue',
  review: 'Bilan',

  prompt: 'Question',
  hint: 'Précision',

  title: 'Titre',
  description: 'Description',
  offset: 'Jour',
  owner: 'Responsable de l’étape',
  mandatory: 'Obligatoire',
  scheduledAt: 'Prévue le',
  notes: 'Notes',
  archived: 'Archivée',
  isDefault: 'Issue par défaut',
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
  outcome: 'Issue',
  allOutcomes: 'Toutes les issues',
} as const

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
  previousWeek: 'Semaine précédente',
  nextWeek: 'Semaine suivante',
  copyText: 'Copier l’annonce',
  showAnnouncement: 'Afficher l’annonce',
  includeImage: 'Inclure l’image',
  editTitle: 'Modification',
  previewLabel: 'Aperçu',
  author: 'Memora',
  restore: 'Restaurer l’annonce générique',
  copyImage: 'Copier l’image',
  textCopied: 'Annonce copiée',
  announcementCopied: 'Annonce et image copiées',
  imageCopied: 'Image copiée, colle-la sous l’annonce',
  imageFailed: 'Image impossible à copier',
  previewTitle: 'Annonce',
  weekEmpty: 'Aucun entretien cette semaine',
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
