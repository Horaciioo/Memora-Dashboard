/**
 * Copy of the absence surfaces
 * @type {Record<string, string>}
 */

export const ABSENCE_COPY = {
  title: 'Absences',
  lead: 'Pose une absence dès qu’elle dépasse {threshold} jours. En dessous, profite, rien à déclarer.',
  add: 'Poser une absence',
  emptyTitle: 'Aucune absence',
  emptyDescription: 'Pose ta première absence, elle partira en validation.',
  filterTitle: 'Aucune absence ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Retirer cette absence ?',
  deleteDescription: 'La demande disparaît définitivement.',
  tabMine: 'Mes absences',
  tabTeam: 'Toute l’équipe',
  tabPending: 'À traiter',
  approve: 'Valider',
  refuse: 'Refuser',
  cancel: 'Annuler la demande',
  reviewTitle: 'Traiter cette absence',
  reviewNote: 'Mot au modérateur',
  tooShort: 'Une absence se déclare à partir de {min} jours.',
  tooLong: 'Une absence ne peut pas dépasser {max} jours.',
  days: 'jours',
  dayOne: 'jour',
  pendingCount: 'en attente',
  noPendingTitle: 'Rien à traiter',
  noPendingDescription: 'Toutes les demandes sont traitées.',
} as const

/**
 * Labels of the absence form
 * @type {Record<string, string>}
 */

export const ABSENCE_FIELD_COPY = {
  startDate: 'Premier jour',
  endDate: 'Dernier jour',
  reason: 'Motif',
  reasonHint: 'Facultatif, mais ça aide ton responsable.',
  member: 'Modérateur',
  status: 'Statut',
  reviewNote: 'Mot au modérateur',
} as const
