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
  threeDays: '3 jours',
  viewsTitle: 'Affichage',
  creatorPicker: 'YouTubeur affiché',
  allCreators: 'Tous',
  moreEntries: 'Voir la journée',
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
  sidebarLayers: 'Filtres',
  sidebarTypes: 'Types',
  sidebarCreators: 'YouTubeurs',
  search: 'Rechercher un event…',
  meetingTopicsTitle: 'Sujets prévus',
  meetingTopicsEmpty: 'Aucun sujet prévu.',
  meetingMinutesTitle: 'Compte-rendu',
  meetingMinutesEmpty: 'Pas encore de compte-rendu.',
  birthdayMessage: 'N’hésite pas à lui souhaiter un merveilleux anniversaire !',
  preview: 'Aperçu',
  // Roll-call
  infoTitle: 'Informations',
  linkCopied: 'Lien copié',
  rollCallTitle: 'Appel de présence',
  respondPresent: 'Je serai là',
  respondAbsent: 'Je ne serai pas là',
  yourAnswer: 'Ta réponse',
  yourPresence: 'Ta présence',
  // Weighted word sits between the parts
  answeredPresent: ['Tu as ', 'répondu', ' présent(e)'],
  answeredPresentEnd: ' !',
  // Words around the two bold hours
  hoursSpan: [' de ', ' à '],
  // A live sends the member to its page once they said they come
  answeredLive: ['Tu as ', 'notifié', ' être présent'],
  liveLink: 'Le lien : ',
  liveLinkLabel: 'Live en cours',
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
  subject: 'Responsable',
  visibility: 'Visibilité',
  startsAt: 'Début',
  endsAt: 'Fin',
  allDay: 'Toute la journée',
  youtuber: 'YouTubeur',
  project: 'Projet',
  description: 'Description',
  rollCall: 'Demander la présence',
  teams: 'Fonctions convoquées',
  members: 'Membres en plus',
  remindAt: 'Rappel aux sans-réponse',
  remindAtHint: 'Laisse vide pour un rappel la veille en fin de journée.',
  requestSubject: 'Sujet',
  requestDay: 'Jour souhaité',
  session: 'Session',
  slotDays: 'Jours',
  slotMembers: 'Modérateurs concernés',
  slotTeam: 'Équipe concernée',
  slotFrom: 'Ouverture',
  slotTo: 'Fermeture',
  recruitmentSession: 'Recrutement',
  junior: 'Junior',
  trainer: 'Formateur',
  responsables: 'Responsables',
} as const

/**
 * Wording of the academy templates of the calendar
 * @type {Record<string, string>}
 */

export const ACADEMY_EVENT_COPY = {
  sessionInfo: 'La Session du Junior : les Formateurs et les Juniors proposés en dépendent.',
  juniorInfo: 'Le Junior que l’évènement concerne, il en est convoqué.',
  trainerInfo: 'Le Formateur qui reçoit le Junior, toi par défaut.',
  responsablesInfo: 'Les Responsables du YouTubeur qui ne sont pas absents.',
  reviewDone: 'Bilan déjà réalisé',
  reviewOpensOn: 'Ouvert à partir du {date}',
  reviewNotYet: 'Ce bilan se déclare la semaine qui précède la fin de la période.',
  reviewWaitsFirst: 'Le bilan de la période 1 passe d’abord',
} as const

/**
 * Audience picker wording
 * @type {Record<string, string>}
 */

export const AUDIENCE_COPY = {
  // Under a fixed audience
  everyoneHint: 'Tout Memora est concerné !',
  responsablesHint: 'Seuls les Responsables sont concernés !',
  adminsHint: 'Réservé aux Administrateurs !',
  teams: 'Équipes',
  youtuberTeam: 'Toute l’équipe de',
  noYoutuber: 'Sans YouTubeur',
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
  subject: 'Le Responsable de l’évènement, s’il y en a un.',
  visibility:
    'Qui voit l’évènement sur son calendrier. L’administration entière, c’est celle du YouTubeur.',
  slotDays:
    'Du premier au dernier jour, le dimanche est laissé de côté. Chaque jour est coupé en créneaux de 15 minutes.',
  slotAudience: 'Seule l’équipe concernée voit ces créneaux !',
  slotMembers: 'Chaque Modérateur de l’équipe reçoit son bilan annuel à programmer !',
  slotTeam: 'L’équipe dont les Modérateurs passent leur bilan annuel.',
  slotTeamSole: 'Tu ne gères que cette équipe !',
  teamOnly: 'Tu ne peux que choisir ton équipe !',
  fixedAudience: 'Ce modèle fixe qui est concerné !',
  fixedLead: '{name} dirige cette réunion !',
  noSession: 'Aucune session en cours pour ce modèle.',
  recruitmentSession:
    'Les dates du Recrutement qui en dépendent : les changer ici les change sur la page Recrutement.',
  zoneSession: 'La Session de l’Academy dont la zone suit la Timeline.',
  startsAt: 'Le moment où l’évènement commence.',
  templateNeedsKind: 'Un type doit d’abord être choisi !',
  endsAt: 'Le moment où il se termine. Vide, il dure une heure.',
  youtuber: 'Le créateur concerné par l’évènement.',
  project: 'Le projet lié à l’évènement, s’il y en a un.',
  description: 'Ce qu’il faut savoir avant d’y aller.',
  rollCall: 'Chaque personne convoquée indique si elle sera là.',
  teams: 'Les fonctions, chez un YouTubeur, dont tous les membres sont convoqués.',
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
  writtenPhase: 'Période d’entretiens écrits',
  oralPhase: 'Période d’entretiens oraux',
} as const

/**
 * Wording of the annual reviews
 * @type {Record<string, string>}
 */

export const ANNUAL_REVIEW_COPY = {
  title: 'Bilans annuels',
  taskTitle: 'Tu as ton bilan annuel à programmer !',
  taskBody: 'Clique sur un créneau libre du calendrier pour le prendre.',
  questionsTitle: 'Prépare les questions du bilan annuel',
  questionsBody: 'Rédige les questions que tu poseras aux Modérateurs pendant leurs bilans.',
  eventTitle: 'Bilan annuel non posé',
  takenTitle: 'Bilan annuel de {name}',
  projectCreated: 'Le projet a bien été créé',
  slotPresent: '{name} a répondu présent !',
  slotAbsent: '{name} a répondu absent.',
  slotPending: '{name} n’a pas encore répondu.',
  noSlotYet: 'Aucun créneau n’a encore été pris.',
  slotTaken: 'Créneau déjà réservé',
  slotRaced: 'Ce créneau vient d’être pris, choisis-en un autre.',
  takeSlot: 'Prendre ce créneau',
  inCalendar: 'Dans le calendrier',
  periodCalendar: 'Calendrier de la période',
  seeInCalendar: 'Voir dans le calendrier',
  slotsCount: '{taken}/{total}',
  openOne: '1 créneau libre',
  openMany: '{n} créneaux libres',
  pickSlot: 'Choisis l’heure',
  clearOpen: 'Supprimer tous les créneaux non pris.',
  clearOpenTitle: 'Supprimer les créneaux non pris ?',
  clearOpenLead:
    'Les créneaux déjà pris restent. Ceux qui sont libres disparaissent du calendrier.',
  clearOpenDone: 'Les créneaux non pris sont supprimés',
  placeTitle: 'Placer un Modérateur',
  placeVerb: 'Le placer',
  placeChoose: 'Choisir un Modérateur',
  placed: 'Le Modérateur est placé, il doit confirmer sa présence',
  cancelSlot: 'Annuler ce créneau',
  cancelTitle: 'Annuler ce créneau ?',
  cancelLead: 'Veux-tu plutôt le reporter sur un autre créneau libre ?',
  postpone: 'Le reporter',
  cancelAnyway: 'Annuler quand même',
  keep: 'Garder',
  chooseSlot: 'Choisir un créneau libre',
  noOpenSlot: 'Aucun autre créneau libre.',
  cancelled: 'Créneau annulé, le Modérateur est prévenu',
  postponed: 'Créneau reporté, le Modérateur doit confirmer',
  reminderTitle: 'Plus que 2 jours pour choisir ton bilan annuel !',
  slotTakenToast: 'Créneau pris, tes Responsables sont prévenus',
  notInTeam: 'Ce créneau est réservé aux Modérateurs de l’équipe concernée.',
  notModerator: 'Seuls les Modérateurs prennent un créneau ici.',
  badRange: 'Choisis une fin après le début, avec des jours du lundi au samedi.',
} as const

/**
 * Themes the model picker files the models under, in order
 * @type {readonly string[]}
 */

export const TEMPLATE_CATEGORIES: readonly string[] = [
  'Réunions',
  'Lives',
  'Academy',
  'Recrutement',
  'Technique',
]

/**
 * Weekday abbreviations
 * @type {string[]}
 */

export const WEEKDAY_LABELS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
