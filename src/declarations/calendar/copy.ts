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
  legend: 'Légende',
  legendColours: 'Couleurs affichées',
  legendSources: 'Origines',
  legendEmpty: 'Rien à colorer sur cette période.',
  selected: 'sélectionné',
  selectedPlural: 'sélectionnés',
  clearSelection: 'Tout désélectionner',
  editSelection: 'Modifier la sélection',
  deleteSelection: 'Supprimer la sélection',
  deleteManyTitle: 'Supprimer ces évènements ?',
  deleteManyDescription: 'Ils disparaissent du calendrier de tout le monde.',
  readOnlyNotice: 'Cet élément vient d’un autre écran, il se modifie là-bas.',
  bulkShift: 'Décaler la sélection',
  filters: 'Filtrer les origines',
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
