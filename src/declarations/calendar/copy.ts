/**
 * Copy of the calendar surfaces
 * @type {Record<string, string>}
 */

export const CALENDAR_COPY = {
  title: 'Calendrier',
  lead: 'Ce qui est prévu cette semaine et ce mois-ci, filtré sur ce que tu as le droit de voir.',
  add: 'Poser un évènement',
  requestMeeting: 'Demander un rendez-vous',
  requestSend: 'Envoyer',
  requestSent: 'Demande envoyée à tes responsables',
  requestNoLead: 'Aucun responsable n’est rattaché à tes équipes pour l’instant.',
  requestLead: 'Tes responsables reçoivent ta demande et te répondent.',
  deleteTitle: 'Supprimer cet évènement ?',
  deleteDescription: 'Il disparaît du calendrier de tout le monde.',
  month: 'Mois',
  week: 'Semaine',
  agenda: 'Planning',
  agendaEmpty: 'Rien de prévu sur cette période.',
  day: 'Jour',
  // Pointer mode
  gridMode: 'Geste sur la grille',
  modeDraw: 'Tracer',
  modeSelect: 'Sélectionner',
  today: 'Aujourd’hui',
  previous: 'Période précédente',
  previousShort: 'Précédent',
  nextShort: 'Suivant',
  next: 'Période suivante',
  allDayRow: 'Journée',
  moveHint:
    'Glisse un évènement ailleurs, ou tire sur une colonne pour en créer un. Maj + clic pour en sélectionner plusieurs.',
  more: 'de plus',
  edit: 'Modifier l’évènement',
  selected: 'Évènement sélectionné',
  selectedPlural: 'Évènements sélectionnés',
  clearSelection: 'Tout désélectionner',
  editSelection: 'Modifier la sélection',
  deleteSelection: 'Supprimer la sélection',
  deleteManyTitle: 'Supprimer ces évènements ?',
  deleteManyDescription: 'Ils disparaissent du calendrier de tout le monde.',
  readOnlyNotice: 'Cet élément vient d’un autre écran, il se modifie là-bas.',
  // Sidebar
  sidebarToggle: 'Calendriers et filtres',
  sidebarLayers: 'Calendriers',
  sidebarCreators: 'YouTubeurs',
  search: 'Rechercher un event…',
  meetingTopicsTitle: 'Sujets prévus',
  meetingTopicsEmpty: 'Aucun sujet prévu.',
  meetingMinutesTitle: 'Compte-rendu',
  meetingMinutesEmpty: 'Pas encore de compte-rendu.',
  birthdayMessage: 'N’hésite pas à lui souhaiter un merveilleux anniversaire !',
  preview: 'Aperçu',
  // Roll-call
  rollCallTitle: 'Appel de présence',
  respondPresent: 'Je serai là',
  respondAbsent: 'Je ne serai pas là',
  yourAnswer: 'Ta réponse',
  yourPresence: 'Ta présence',
  // Weighted word sits between the parts
  answeredPresent: ['Tu as ', 'répondu', ' présent !'],
  answeredAbsent: ['Tu as ', 'notifié', ' ne pas être présent.'],
  changeMind: 'Je change d’avis',
  hoursTitle: 'Tes horaires',
  hoursLead: 'De quand à quand penses-tu être disponible ?',
  hoursConfirm: 'Je serai là',
  hoursSkip: 'Passer',
  hoursFrom: 'Disponible à partir de',
  hoursTo: 'Jusqu’à',
  hoursRange: 'de {from} à {to}',
  badHours: 'Choisis une heure de fin après l’heure de début.',
  nobody: 'Personne',
  noAnswerYet: 'Tu n’as pas encore répondu.',
  remindPending: 'Relancer les sans-réponse',
  reminderSent: 'Rappel envoyé aux sans-réponse',
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
  remindAt: 'Rappel aux sans-réponse',
  remindAtHint: 'Laisse vide pour un rappel la veille en fin de journée.',
  requestSubject: 'Sujet',
  requestDay: 'Jour souhaité',
  junior: 'Junior',
  trainer: 'Formateur',
  responsables: 'Responsables',
} as const

/**
 * Wording of the academy templates of the calendar
 * @type {Record<string, string>}
 */

export const ACADEMY_EVENT_COPY = {
  juniorInfo: 'Le Junior que l’évènement concerne, il en est convoqué.',
  trainerInfo: 'Le Formateur qui reçoit le Junior, toi par défaut.',
  responsablesInfo: 'Les Responsables du YouTubeur qui ne sont pas absents.',
  reviewDone: 'Bilan déjà réalisé',
  reviewWaitsFirst: 'Le bilan de la période 1 passe d’abord',
} as const

/**
 * Audience picker wording
 * @type {Record<string, string>}
 */

export const AUDIENCE_COPY = {
  teams: 'Équipes',
  juniorTeams: 'Équipes junior',
  leadsOnly: 'Responsables de l’équipe uniquement',
  leadsOnlyInfo: 'Seuls les responsables associés à l’équipe voient l’évènement.',
  leadsOnlyLabel: 'Responsables de l’équipe',
} as const

/**
 * Explanations behind each calendar field
 * @type {Record<string, string>}
 */

export const CALENDAR_FIELD_INFO = {
  title: 'Le nom affiché sur la case du calendrier.',
  kind: 'La nature de l’évènement, elle décide de sa couleur.',
  template: 'Un évènement préparé à l’avance : il remplit le type, la couleur et la visibilité.',
  subject: 'Le membre que l’évènement concerne directement, s’il y en a un.',
  visibility:
    'Qui voit l’évènement sur son calendrier. L’administration entière, c’est celle du YouTubeur.',
  startsAt: 'Le moment où l’évènement commence.',
  endsAt: 'Le moment où il se termine. Vide, il dure une heure.',
  youtuber: 'Le créateur concerné par l’évènement.',
  project: 'Le projet lié à l’évènement, s’il y en a un.',
  description: 'Ce qu’il faut savoir avant d’y aller.',
  rollCall: 'Chaque personne convoquée indique si elle sera là.',
  teams: 'Les équipes dont tous les membres sont convoqués.',
  liveAlone: 'Un live se planifie seul : il demande sa plateforme et ses Coordinateurs.',
  members: 'Des personnes convoquées en plus des équipes (et de l’équipe Lives pour un live).',
  remindAt: 'Le moment où un rappel part à ceux qui n’ont pas répondu.',
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
  academySession: 'PIM',
  trainingsZone: 'Formations',
  reviewsZone: 'Bilans',
  interview: 'Entretien',
} as const

/**
 * Weekday abbreviations
 * @type {string[]}
 */

export const WEEKDAY_LABELS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
