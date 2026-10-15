/**
 * Copy of the job board
 * @type {Record<string, string>}
 */

export const QUEUES_COPY = {
  stoppedTitle: 'Les files de jobs sont à l’arrêt',
  stoppedLead:
    'Redis ou les files ne sont pas actifs sur cet environnement, aucun job ne tourne en dehors des requêtes.',
  schedule: 'Cadence',
  onDemand: 'À la demande',
  nextRun: 'Prochain passage',
  lastRun: 'Dernier passage',
  never: 'Jamais passé',
  waiting: 'En attente',
  active: 'En cours',
  failed: 'Échoués',
  delayed: 'Différés',
  recent: 'Derniers passages',
  noRun: 'Aucun passage enregistré pour l’instant.',
  states: { completed: 'Réussi', failed: 'Échoué', active: 'En cours' },
  attempts: 'tentatives',
  retry: 'Relancer les échecs',
  retryTitle: 'Relancer les jobs échoués',
  retryLead: 'Tous les passages échoués de ce job repartent maintenant. Ça agit sur la production.',
  retryDone: 'Relancé',
  retryFailed: 'La relance a échoué.',
  paused: 'En pause',
  noWorker: 'Aucun worker',
} as const
