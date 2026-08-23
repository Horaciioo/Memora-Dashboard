/**
 * Copy of the absence surfaces
 * @type {Record<string, string>}
 */

export const ABSENCE_COPY = {
  title: 'Absences',
  underThresholdNotice:
    'Si ton absence est inférieure à {threshold} jours, tu n’es pas obligé(e) d’en poser une : profite, fais ce que tu as à faire. Tu peux en revanche décider de notifier tes responsables, ou ton équipe.',
  add: 'Poser une absence',
  emptyTitle: 'Aucune absence en cours',
  emptyDescription:
    'Tu peux poser une absence quand tu le souhaites, elle part à tes responsables.',
  planAnother: 'Prévoir une autre absence',
  timelineDisclaimer:
    'Cette timeline n’est pas une source d’autorisation. Tu pars en absence quand tu le désires : elle est simplement envoyée à tes responsables pour qu’ils puissent s’organiser sans que tu aies à les solliciter.',
  timelineLabel: 'Progression de l’absence',
  timelineDrafting: 'Absence en train d’être posée',
  timelineDeclared: 'Absence posée',
  timelineAcknowledged: 'Absence prise en compte',
  historyTitle: 'Historique',
  deleteTitle: 'Retirer cette absence ?',
  deleteDescription: 'La demande disparaît définitivement.',
  queueTitle: 'Demandes à traiter',
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
  noPendingDescription: 'Toutes les demandes de tes équipes sont traitées.',
} as const

/**
 * Labels of the absence form
 * @type {Record<string, string>}
 */

export const ABSENCE_FIELD_COPY = {
  startDate: 'Premier jour',
  endDate: 'Dernier jour',
  reason: 'Motif',
  member: 'Modérateur',
  status: 'Statut',
  reviewNote: 'Mot au modérateur',
} as const
