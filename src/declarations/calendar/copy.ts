/**
 * Copy of the calendar surfaces
 * @type {Record<string, string>}
 */

export const CALENDAR_COPY = {
  title: 'Calendrier',
  lead: 'Ce qui est prévu cette semaine et ce mois-ci, filtré sur ce que tu as le droit de voir.',
  add: 'Poser un évènement',
  emptyTitle: 'Rien de prévu',
  emptyDescription: 'Pose un premier évènement pour que l’équipe sache ce qui arrive.',
  noTypesTitle: 'Aucun type d’évènement',
  noTypesDescription: 'Déclare tes lives et tes réunions dans la configuration avant de planifier.',
  configure: 'Ouvrir la configuration',
  deleteTitle: 'Supprimer cet évènement ?',
  deleteDescription: 'Il disparaît du calendrier de tout le monde.',
  month: 'Mois',
  week: 'Semaine',
  today: 'Aujourd’hui',
  previous: 'Période précédente',
  next: 'Période suivante',
  allDayRow: 'Journée',
  moveHint: 'Glisse un évènement sur un autre créneau pour le déplacer.',
  more: 'de plus',
  edit: 'Modifier l’évènement',
} as const

/**
 * Labels of the calendar form
 * @type {Record<string, string>}
 */

export const CALENDAR_FIELD_COPY = {
  title: 'Intitulé',
  type: 'Type d’évènement',
  visibility: 'Visibilité',
  visibilityHint: 'Laisse vide pour reprendre la visibilité du type.',
  startsAt: 'Début',
  endsAt: 'Fin',
  allDay: 'Toute la journée',
  youtuber: 'YouTubeur',
  project: 'Projet',
  description: 'Description',
} as const

/**
 * Weekday abbreviations, Monday first
 * @type {string[]}
 */

export const WEEKDAY_LABELS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
