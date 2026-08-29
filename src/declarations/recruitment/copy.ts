/**
 * Copy of the recruitment space
 * @type {Record<string, string>}
 */

export const RECRUITMENT_COPY = {
  title: 'Recrutements',
  lead: 'Une session par créateur et par fonction. L’annonce part dehors, les entretiens se tiennent sur Discord, tout ce qui compte se garde ici.',
  confidential: 'Confidentiel',
  add: 'Ouvrir une session',
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

  tabCandidates: 'Candidats',
  tabQuestions: 'Questionnaire',
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
  spectatorsTitle: 'Spectateurs',
  noSpectator: 'Aucun spectateur',
  memberLinked: 'Déjà modérateur',
  openMember: 'Ouvrir la fiche',

  commentsTitle: 'Commentaires',
  commentAdd: 'Écrire un commentaire',
  commentsEmptyTitle: 'Aucun commentaire',
  commentsEmptyDescription: 'Consigne ici ce que l’entretien a montré.',
  commentDeleteTitle: 'Supprimer ce commentaire ?',
  commentDeleteDescription: 'Il ne sera plus lisible par personne.',

  questionsTitle: 'Questionnaire d’entretien',
  questionsLead: 'La même trame pour tous les candidats de cette session.',
  questionsEmptyTitle: 'Aucune question',
  questionsEmptyDescription:
    'Déclare les questions depuis la configuration pour ce créateur et cette fonction.',
  questionsConfigure: 'Ouvrir la configuration',

  timelineTitle: 'Timeline de la session',
  timelineLead: 'Posée depuis la trame déclarée en configuration, puis tenue à la main.',
  stepAdd: 'Ajouter une étape',
  stepEdit: 'Modifier l’étape',
  stepDone: 'Marquer faite',
  stepDoneBadge: 'Faite',
  stepUndone: 'Rouvrir',
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
    'Déclare les issues de recrutement en configuration pour ouvrir le tableau.',
  noOutcome: 'Sans issue',

  instructionsTitle: 'Consignes de la session',
  instructionsLead: 'Rédigées par les responsables, propres à cette session.',
  instructionsEdit: 'Modifier les consignes',
  instructionsEmptyTitle: 'Aucune consigne',
  instructionsEmptyDescription: 'Écris ce que les recruteurs doivent savoir avant les entretiens.',
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
  status: 'État',
  summary: 'Résumé',
  opensAt: 'Ouverture',
  closesAt: 'Clôture',
  instructions: 'Consignes',

  discordId: 'Identifiant Discord',
  formId: 'Identifiant du formulaire',
  recruiter: 'Recruteur',
  spectators: 'Spectateurs',
  interviewAt: 'Date de l’entretien',
  attended: 'Présence',
  outcome: 'Issue',
  review: 'Bilan',

  comment: 'Commentaire',

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
