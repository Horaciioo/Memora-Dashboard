/**
 * Copy of the personal surfaces
 * @type {Record<string, string>}
 */

export const PERSONAL_COPY = {
  title: 'Accueil',
  greeting: 'Salut {name}',
  lead: '{date}, voici ce qui t’attend.',
  newsTitle: 'Dernière nouveauté',
  newsOpen: 'Lire la note',
  newsAll: 'Toutes les nouveautés',
  calmTodoTitle: 'Tout est à jour',
  calmTodoLead: 'Rien ne demande ton attention pour le moment.',
  calmAheadTitle: 'Rien de prévu',
  calmAheadLead: 'Ni réunion ni anniversaire dans les semaines à venir.',
  aheadTitle: 'À venir',
  aheadEmpty: 'Rien de prévu dans les semaines à venir.',
  todoTitle: 'À toi',
  nextTitle: 'Ensuite',
  more: 'Voir la suite',
  less: 'Réduire',
  livesTitle: 'Les lives',
  absenceTitle: 'Absence de {name}',
  attendanceKind: 'Appel de présence',
  attendanceAnswer: 'Répondre',
  allDay: 'Journée',
  birthdayOf: 'Anniversaire de {name}',
  urgentTitle: 'Urgent',
  urgentNoReason: 'Aucun motif donné.',
  urgentSince: 'Depuis le',
  urgentBy: 'Changé par',
  urgentScope: 'Pour',
  urgentGo: 'Voir le livecon',
  attendanceTitle: 'Appels de présence',
  attendanceLead: 'Les évènements à venir où ta présence est demandée.',
  attendanceEmpty: 'Aucun appel de présence en attente.',
  attendanceOpen: 'Répondre sur le calendrier',
  birthdaysTitle: 'Anniversaires',
  birthdaysEmpty: 'Aucun anniversaire dans les semaines à venir.',
  birthdayToday: 'Aujourd’hui',
  meetingsTitle: 'Tes réunions',
  meetingsEmpty: 'Aucune réunion ne t’attend pour le moment.',
} as const

/**
 * Copy of the home task list
 * @type {Record<string, string>}
 */

export const PERSONAL_TASK_COPY = {
  title: 'À faire',
  empty: 'Rien ne t’attend, tout est à jour.',
  assignTrainer: 'Attribuer un Formateur',
  assignTrainerDescription:
    'Ce junior a confirmé sa fiche. Choisis le Formateur qui le suivra pendant toute sa PIM.',
  launchPim: 'Lancer la PIM quand même',
  launchPimDescription:
    'Certains Juniors ont fini leur formulaire, d’autres non. La PIM se lance seule quand tout le monde a fini ; tu peux aussi la lancer maintenant, les retardataires partiront dès qu’ils auront fini.',
  declareKickoff: 'Déclarer le début de PIM',
  declareKickoffDescription:
    'Le Formateur est attribué. Déclare le début de la PIM : le lien d’intégration s’ouvre pour cette personne.',
  reviewDue: {
    REVIEW_ONE: 'Faire le bilan de 1ère phase',
    REVIEW_FINAL: 'Faire le bilan de 2e phase',
    BONUS: 'Faire le bilan définitif',
  },
  reviewDueDescription:
    'Rédige le bilan, note chaque compétence, puis dépose-le : le Responsable tranche ensuite.',
  decision: '{trainer} a déposé son bilan pour {junior}',
  decisionDescription: 'Lis le bilan et l’avis du Formateur, puis tranche depuis l’onglet Bilans.',
  secondPeriod: 'Lancer la période 2',
  secondPeriodDescription:
    'Des passages sont accordés, d’autres attendent encore. La période 2 se lance seule quand tout le monde est décidé ; tu peux aussi la lancer maintenant.',
  trainingContext: 'Formation indispensable',
  open: 'Ouvrir',
  go: 'Y aller, avec le guide',
  goPlain: 'Y aller',
  guideTitle: 'Marche à suivre',
  what: 'Ce qui doit se passer',
  where: 'Où agir',
  due: 'Prévue le',
  showAll: 'Voir toutes les tâches',
  showLess: 'Réduire',
} as const
