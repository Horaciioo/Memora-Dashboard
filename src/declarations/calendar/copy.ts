/**
 * Copy of the calendar surfaces
 * @type {Record<string, string>}
 */

export const CALENDAR_COPY = {
  title: 'Calendrier',
  lead: 'Ce qui est prévu cette semaine et ce mois-ci, filtré sur ce que tu as le droit de voir.',
  add: 'Poser un évènement',
  noTemplatesTitle: 'Aucun modèle d’évènement',
  noTemplatesDescription:
    'Déclare tes modèles de lives et de réunions dans la configuration pour aller plus vite.',
  configure: 'Ouvrir la configuration',
  deleteTitle: 'Supprimer cet évènement ?',
  deleteDescription: 'Il disparaît du calendrier de tout le monde.',
  month: 'Mois',
  week: 'Semaine',
  today: 'Aujourd’hui',
  previous: 'Période précédente',
  next: 'Période suivante',
  allDayRow: 'Journée',
  moveHint:
    'Glisse un évènement ailleurs, ou tire sur une colonne pour en créer un. Maj + clic pour en sélectionner plusieurs.',
  more: 'de plus',
  edit: 'Modifier l’évènement',
  selected: 'sélectionné',
  selectedPlural: 'sélectionnés',
  clearSelection: 'Tout désélectionner',
  editSelection: 'Modifier la sélection',
  deleteSelection: 'Supprimer la sélection',
  deleteManyTitle: 'Supprimer ces évènements ?',
  deleteManyDescription: 'Ils disparaissent du calendrier de tout le monde.',
  readOnlyNotice: 'Cet élément vient d’un autre écran, il se modifie là-bas.',
  // Legend, its icon button and the page it opens
  legendInfo: 'Comprendre les couleurs et les zones',
  legendTitle: 'Légende du calendrier',
  legendLead: 'À quoi correspondent les couleurs, les zones et les niveaux de visibilité.',
  legendKindsTitle: 'Les trois formes',
  legendSourcesTitle: 'Les origines et leurs couleurs',
  legendZonesTitle: 'Zones et évènements',
  legendZonesText:
    'Une zone est un fond pastel posé sur une plage de jours. Les évènements et les périodes, eux, sont peints en couleur pleine avec un titre en noir pour rester lisibles par-dessus.',
  legendVisibilityTitle: 'Qui voit quoi',
  legendVisibilityText:
    'Chaque évènement porte un niveau de visibilité. « Tout le monde » est visible par tous, « Responsables et plus » masque l’évènement aux modérateurs, « Administrateurs seuls » le réserve à l’encadrement.',
  legendUnderstood: 'J’ai compris !',
  // Detail modal, meetings and birthdays
  meetingTopicsTitle: 'Sujets prévus',
  meetingTopicsEmpty: 'Aucun sujet prévu.',
  meetingMinutesTitle: 'Compte-rendu',
  meetingMinutesEmpty: 'Pas encore de compte-rendu.',
  birthdayMessage: 'N’hésite pas à lui souhaiter un merveilleux anniversaire !',
  preview: 'Aperçu',
  // Roll-call, its answer buttons and its roster
  rollCallTitle: 'Appel de présence',
  rollCallLead: 'Dis à ton Responsable si tu seras là.',
  respondPresent: 'Je serai là',
  respondAbsent: 'Je ne serai pas là',
  yourAnswer: 'Ta réponse',
  noAnswerYet: 'Tu n’as pas encore répondu.',
  remindPending: 'Relancer les sans-réponse',
  reminderSent: 'Rappel envoyé aux sans-réponse',
  rosterHidden: 'Ton Responsable n’a pas ouvert le détail des réponses.',
  noRoster: 'Personne n’est encore convoqué.',
} as const

/**
 * Labels of the calendar form
 * @type {Record<string, string>}
 */

export const CALENDAR_FIELD_COPY = {
  title: 'Intitulé',
  emoji: 'Émoji',
  kind: 'Type',
  template: 'Modèle',
  accent: 'Couleur',
  accentHint: 'Ignorée dès qu’un membre est rattaché, sa fonction donne alors la couleur.',
  subject: 'Membre concerné',
  visibility: 'Visibilité',
  startsAt: 'Début',
  endsAt: 'Fin',
  allDay: 'Toute la journée',
  youtuber: 'YouTubeur',
  project: 'Projet',
  description: 'Description',
  rollCall: 'Demander la présence',
  teams: 'Équipes convoquées',
  members: 'Membres en plus',
  rosterShared: 'Réponses visibles par l’équipe',
  rosterSharedHint: 'Sinon, seuls les Responsables voient qui a répondu quoi.',
  remindAt: 'Rappel aux sans-réponse',
  remindAtHint: 'Laisse vide pour un rappel la veille en fin de journée.',
} as const

/**
 * Titles given to the entries read from another domain
 * @type {Record<string, string>}
 */

export const CALENDAR_PROJECTION_COPY = {
  absence: 'Absence',
  birthday: 'Anniversaire',
  meeting: 'Réunion',
  pendingAbsence: 'Absence en attente',
} as const

/**
 * Weekday abbreviations, Monday first
 * @type {string[]}
 */

export const WEEKDAY_LABELS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
