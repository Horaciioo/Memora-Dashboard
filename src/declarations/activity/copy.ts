/**
 * Copy of the journal surfaces
 * @type {Record<string, string>}
 */

export const ACTIVITY_COPY = {
  journalExport: 'Export du journal, {count} entrées',
  personalExport: 'Export des données personnelles',
  referenceDropped: '{section}, supprimé avec ses données ({lives} lives)',
  did: 'a',
  system: 'Le système',
  showDetail: 'Voir le détail',
  detailTitle: 'Détail de l’action',
  arrow: '→',
  moreLines: '+ {count} autres',
  errorLabel: 'Erreur',
  errorRoute: 'Requête',
  errorTrace: 'Trace',
  errorFallback: 'Erreur inattendue',
  errorDatabase: 'Erreur de base de données {code}',
  // Sentences of the topic events
  topicContext: ' du sujet « {title} »',
  topicAddedRest: 'le sujet « {title} » à la réunion',
  topicRemovedRest: 'le sujet « {title} » de la réunion',
} as const
