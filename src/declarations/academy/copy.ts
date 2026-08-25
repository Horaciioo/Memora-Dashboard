/**
 * Copy of the academy surfaces
 * @type {Record<string, string>}
 */

export const ACADEMY_COPY = {
  title: 'Marsha Academy',
  lead: 'Chaque session accueille, forme, suit et valide ses juniors jusqu’à leur autonomie.',
  glossaryTitle: 'Lexique de l’Academy',
  glossaryLead: 'Les mots du domaine, définis une fois pour toutes.',
  sessionAdd: 'Ouvrir une session',
  emptyTitle: 'Aucune session',
  emptyDescription: 'Ouvre une première session pour accueillir des juniors.',
  sessionDeleteTitle: 'Supprimer cette session ?',
  sessionDeleteDescription: 'Ses juniors, son fil et ses bilans disparaissent avec elle.',
  sessionCount: 'juniors',
  sessionCountOne: 'junior',
  trainers: 'Formateurs',
  trainersLead: 'Les modérateurs qui encadrent cette session.',
  noTrainer: 'Aucun formateur assigné',
  confidential: 'Confidentiel',
  confidentialLead:
    'Tout ce qui vit ici reste entre les personnes autorisées : organisation, retours, évaluations, incidents.',
  tabJuniors: 'Juniors',
  tabTimeline: 'Timeline',
  tabCalendar: 'Calendrier',
  tabMissions: 'Missions',
  tabThread: 'Fil de session',
  juniorsLead: 'Chaque junior est un modérateur existant, suivi par sa fiche individuelle.',
  timelineLead: 'Les étapes de la trame, en retard, en cours ou franchies, junior par junior.',
  timelineSessionWide: 'Avant l’arrivée des juniors',
  timelineEmptyTitle: 'Aucune étape',
  timelineEmptyDescription: 'La trame se configure depuis /configuration/etapes-pim.',
  stepValidate: 'Marquer comme franchie',
  stepReopen: 'Rouvrir cette étape',
  stateDone: 'Franchie',
  stateLate: 'En retard',
  stateCurrent: 'En cours',
  stateIdle: 'À venir',
  juniorAdd: 'Ajouter un junior',
  juniorEmptyTitle: 'Aucun junior',
  juniorEmptyDescription: 'Rattache un modérateur existant pour démarrer son suivi.',
  juniorDeleteTitle: 'Retirer ce junior ?',
  juniorDeleteDescription: 'Son suivi, ses bilans et ses moments quittent la session.',
  noMembersTitle: 'Aucun modérateur disponible',
  noMembersDescription: 'Crée d’abord une fiche de modérateur, le junior s’y rattache ensuite.',
  openMembers: 'Ouvrir les modérateurs',
  threadLead: 'Tout ce qui est prévu ou tenu, surtout ce qui se fait en autonomie.',
  eventAdd: 'Noter un moment',
  eventEmptyTitle: 'Rien de noté',
  eventEmptyDescription:
    'Note formations, bilans, entrevues et points responsables au fil de l’eau.',
  eventDeleteTitle: 'Supprimer ce moment ?',
  eventDeleteDescription: 'La trace disparaît du fil de session.',
  eventDone: 'Tenu',
  eventPlanned: 'Prévu',
  markDone: 'Marquer comme tenu',
  markPlanned: 'Remettre en prévu',
  fileTitle: 'Fiche de suivi individuelle',
  fileLead: 'Progression, bilans et moments de ce junior.',
  progression: 'Progression',
  progressionLead: 'Les formations du programme, validées au fur et à mesure.',
  noTrainingsTitle: 'Aucune formation',
  noTrainingsDescription: 'Déclare les formations du programme dans la configuration.',
  configure: 'Ouvrir la configuration',
  mandatory: 'Obligatoire',
  progress: 'formations validées',
  blocked: 'Formations obligatoires en attente',
  ready: 'Prêt à valider',
  reviews: 'Bilans vocaux',
  reviewsLead:
    'Un point d’écoute, jamais un interrogatoire : ressenti, compte-rendu, puis avis proposé.',
  reviewAdd: 'Écrire un bilan',
  reviewEmptyTitle: 'Aucun bilan',
  reviewEmptyDescription: 'Le premier bilan pose le ressenti global et le compte-rendu du vocal.',
  reviewLocked: 'Les bilans de ce junior ne te sont pas ouverts.',
  reviewDeleteTitle: 'Supprimer ce bilan ?',
  reviewDeleteDescription: 'La trace écrite de ce point disparaît.',
  reviewSubmit: 'Soumettre à décision',
  reviewValidate: 'Valider ce bilan',
  reviewValidateTitle: 'Valider ce bilan ?',
  reviewValidateDescription: 'La FSI avance à l’étape suivante selon l’avis proposé.',
  reviewReject: 'Refuser ce bilan',
  reviewRejectTitle: 'Refuser ce bilan ?',
  reviewRejectDescription: 'Le Formateur devra rédiger un nouveau bilan.',
  validate: 'Valider ce junior',
  validateTitle: 'Valider ce junior ?',
  validateDescription: 'Il sort de l’Academy et passe en modérateur autonome.',
  stop: 'Arrêter le suivi',
  stopTitle: 'Arrêter le suivi ?',
  stopDescription: 'Le junior quitte la session sans validation. Rien n’est supprimé.',
  reopen: 'Reprendre le suivi',
  lives: 'lives accompagnés',
  tabInformations: 'Informations',
  tabCompetences: 'Compétences',
  tabNotes: 'Notes',
  tabObjectives: 'Objectifs',
  tabReviews: 'Bilans',
  skillsLead: 'Le pourcentage de maîtrise de chaque compétence de la fonction et du dispositif.',
  noteAdd: 'Poser une note',
  noteEmptyTitle: 'Aucune note',
  noteEmptyDescription: 'Remarque, observation, avertissement ou compliment, au fil de l’eau.',
  noteLocked: 'Les notes de ce junior ne te sont pas ouvertes.',
  noteDeleteTitle: 'Supprimer cette note ?',
  noteDeleteDescription: 'La trace disparaît de la FSI.',
  objectiveAdd: 'Fixer un objectif',
  objectiveEmptyTitle: 'Aucun objectif',
  objectiveEmptyDescription: 'Les objectifs personnels se fixent une fois la pratique commencée.',
  objectiveLockedTitle: 'Objectifs verrouillés',
  objectiveLockedDescription: 'Ils se déverrouillent une fois le premier bilan validé.',
  objectiveSeeReviews: 'Voir les bilans',
  objectiveDeleteTitle: 'Supprimer cet objectif ?',
  objectiveDeleteDescription: 'Il disparaît de la FSI.',
  myTrainingsTitle: 'Mes formations',
  myTrainingsLead: 'Les formations de ta fonction et de ton dispositif, à ton rythme.',
  myTrainingsNoFsiTitle: 'Aucune FSI active',
  myTrainingsNoFsiDescription: 'Les formations apparaissent une fois ton suivi commencé.',
  myTrainingsEmptyTitle: 'Aucune formation',
  myTrainingsEmptyDescription: 'Rien n’est encore déclaré pour ta fonction et ton dispositif.',
  trainingStart: 'Démarrer',
  trainingResume: 'Reprendre',
  trainingRestart: 'Recommencer',
  trainingAbandon: 'Abandonner',
  trainingComplete: 'Terminer',
  trainingAttempts: 'tentatives',
  trainingAttemptsOne: 'tentative',
  trainingDurationUnit: 'min',
  trainingContentTitle: 'Contenu',
  trainingContentLead: 'Le déroulé de la formation, chapitre par chapitre.',
  viewContent: 'Voir le contenu',
  noContentTitle: 'Contenu à venir',
  noContentDescription: 'Rien n’est encore rédigé pour cette formation.',
  takeQuiz: 'Faire le quiz',
  quizSubmit: 'Valider mes réponses',
  quizResultSuffix: 'bonnes réponses',
  quizAnswered: 'Répondu',
  quizQuestionCount: 'questions',
  quizQuestionCountOne: 'question',
  inviteCopyLink: 'Copier le lien d’admission',
  inviteCopied: 'Lien copié',
} as const

/**
 * Labels of the academy forms
 * @type {Record<string, string>}
 */

export const ACADEMY_FIELD_COPY = {
  function: 'Fonction',
  startsAt: 'Date de début',
  endsAt: 'Date de fin',
  endsAtHint: 'Laissée vide, elle est posée sur la durée la plus courte prévue.',
  status: 'État',
  summary: 'Description',
  trainers: 'Formateurs',
  account: 'Modérateur',
  trainer: 'Formateur référent',
  dispositif: 'Dispositif',
  juniorStatus: 'Suivi',
  liveCount: 'Lives accompagnés',
  bonusLives: 'Lives bonus',
  bonusLivesHint: 'Ouverts sur décision du Responsable, jusqu’au maximum réglé.',
  juniorSummary: 'Remarques',
  kind: 'Type de moment',
  title: 'Intitulé',
  scheduledAt: 'Date et heure',
  junior: 'Junior concerné',
  notes: 'Notes',
  heldAt: 'Date du bilan',
  feeling: 'Ressenti global',
  reviewStage: 'Étape du bilan',
  durationMinutes: 'Durée du vocal (minutes)',
  advice: 'Avis proposé',
  reviewSummary: 'Ce qui progresse, ce qui bloque, ce qui est décidé',
  decisionNote: 'Note de décision',
  noteStage: 'Étape concernée',
  noteKind: 'Type de note',
  noteBody: 'Contenu',
  objectiveTitle: 'Intitulé',
  objectiveDescription: 'Détail',
  objectiveDueAt: 'Échéance',
  objectiveStatus: 'Statut',
  skillPercent: 'Maîtrise',
} as const

/**
 * Copy of the public admission form
 * @type {Record<string, string>}
 */

export const ADMISSION_COPY = {
  title: 'Admission Marsha Academy',
  subtitle: 'Rejoins une session en cours de recrutement.',
  submit: 'Envoyer ma candidature',
  pending: 'Envoi…',
  successTitle: 'Candidature envoyée',
  successDescription: 'Un Formateur vérifie ton dossier, à très vite en vocal !',
  invalidTitle: 'Lien invalide',
  invalidDescription:
    'Ce lien d’admission n’existe plus, a expiré ou a atteint son nombre d’utilisations.',
  duplicateId: 'Cet identifiant Discord est déjà rattaché à un compte.',
} as const

/**
 * Labels of the public admission form
 * @type {Record<string, string>}
 */

export const ADMISSION_FIELD_COPY = {
  displayName: 'Pseudo',
  dispositif: 'Dispositif souhaité',
} as const

/**
 * Copy of the training content editor
 * @type {Record<string, string>}
 */

export const TRAINING_CONTENT_COPY = {
  title: 'Contenu de la formation',
  lead: 'Le contenu se découpe en chapitres, chacun porté par un ou plusieurs blocs.',
  questionLabel: 'Question',
  chapterAdd: 'Ajouter un chapitre',
  chapterEmptyTitle: 'Aucun chapitre',
  chapterEmptyDescription: 'Ajoute un premier chapitre pour commencer le contenu.',
  chapterDeleteTitle: 'Supprimer ce chapitre ?',
  chapterDeleteDescription: 'Ses blocs et ses questions disparaissent avec lui.',
  blockAdd: 'Ajouter un bloc',
  blockEmptyTitle: 'Aucun bloc',
  blockEmptyDescription: 'Ajoute un texte ou un quiz dans ce chapitre.',
  blockDeleteTitle: 'Supprimer ce bloc ?',
  blockDeleteDescription: 'Son contenu disparaît du chapitre.',
  questionAdd: 'Ajouter une question',
  questionEmptyTitle: 'Aucune question',
  questionEmptyDescription: 'Ajoute une première question à ce quiz.',
  questionDeleteTitle: 'Supprimer cette question ?',
  questionDeleteDescription:
    'Les réponses déjà données restent enregistrées, la question disparaît du quiz.',
  choiceAdd: 'Ajouter une réponse',
  choiceEmptyTitle: 'Aucune réponse',
  choiceEmptyDescription: 'Ajoute au moins deux réponses, dont une correcte.',
  choiceDeleteTitle: 'Supprimer cette réponse ?',
  choiceDeleteDescription: 'Elle disparaît de la question.',
} as const

/**
 * Labels of the training content forms
 * @type {Record<string, string>}
 */

export const TRAINING_CONTENT_FIELD_COPY = {
  chapterTitle: 'Titre',
  blockKind: 'Type de bloc',
  blockBody: 'Texte',
  questionPrompt: 'Question',
  questionMultiple: 'Plusieurs bonnes réponses',
  choiceLabel: 'Réponse',
  choiceCorrect: 'Bonne réponse',
} as const
