/**
 * Copy of the admin console blocks
 * @type {Record<string, string>}
 */

export const CONSOLE_COPY = {
  status: 'État de Memora',
  statusLead: 'Les services surveillés, même quand l’application ne répond plus.',
  pulse: 'Ces dernières 24 h',
  errors: 'Erreurs',
  warnings: 'Alertes',
  lastError: 'Dernière erreur',
  noError: 'Aucune',
  activeNow: 'Actifs aujourd’hui',
  sessions: 'Sessions ouvertes',
  jobs: 'Tâches de fond',
  jobsStopped: 'Les files de jobs sont à l’arrêt sur cet environnement.',
  jobFailing: 'Échecs à relancer',
  jobHealthy: 'Aucun échec',
  jobNever: 'Jamais passé',
  version: 'Version',
  probesHistory: 'Historique',
  probesHistoryLead: 'Quatre-vingt-dix jours de mesures, une barre par jour.',
  probesIncidents: 'Incidents',
  probesLive: 'Sujets du back-end',
} as const
