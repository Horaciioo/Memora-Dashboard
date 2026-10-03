/**
 * Copy of the absence surfaces
 * @type {Record<string, string>}
 */

export const ABSENCE_COPY = {
  title: 'Absences',
  lead: 'Pose tes absences, ton équipe s’organise.',
  emptyTitle: 'Aucune absence n’est en cours',
  declare: 'Déclarer une absence',
  stepPeriod: 'Désigne ta période',
  stepPeriodHint: 'Clique le premier jour, puis le dernier. Les jours rayés sont déjà posés.',
  stepReason: 'Un motif à mettre ?',
  stepDone: 'Confirmation',
  timeline: 'Étapes de la déclaration',
  next: 'Continuer',
  cancelDeclaration: 'Annuler',
  back: 'Retour',
  send: 'Envoyer',
  finish: 'Terminer',
  thanks: 'Merci de nous avoir informé',
  reasonLabel: 'Raison :',
  listTitle: 'Tes absences',
  noReason: 'Aucune raison communiquée',
  reasonPlaceholder: 'C’est facultatif, tu n’es pas du tout obligé(e) de te justifier.',
  duration: '{days} jours',
  durationOne: '1 jour',
  statusPending: 'Envoyée',
  statusApproved: 'Prise en compte',
  statusRefused: 'Refusée',
  statusCancelled: 'Annulée',
  reasonTitle: 'Raison communiquée',
  underThresholdNotice:
    'Si ton absence est inférieure à {threshold} jours, tu n’es pas obligé(e) d’en poser une : profite, fais ce que tu as à faire. Tu peux en revanche décider de notifier tes responsables, ou ton équipe.',
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
  showAll: 'Voir toutes les demandes',
  showLess: 'Réduire',
  noPendingDescription: 'Toutes les demandes de tes équipes sont traitées.',
} as const

/**
 * Labels of the absence form
 * @type {Record<string, string>}
 */

export const ABSENCE_FIELD_COPY = {
  dates: 'Dates de l’absence',
  reason: 'Raison communiquée',
  reasonHint: 'Facultatif. Ce que ton équipe doit savoir, jamais un détail médical.',
  member: 'Modérateur',
  status: 'Statut',
  reviewNote: 'Mot au modérateur',
} as const

/**
 * Explanations behind each absence field
 * @type {Record<string, string>}
 */

export const ABSENCE_FIELD_INFO = {
  dates: 'Le premier et le dernier jour où tu ne seras pas disponible.',
  reason: 'Ce que tes responsables liront à côté de tes dates.',
  reviewNote: 'Un mot que le modérateur lira avec la réponse.',
} as const
