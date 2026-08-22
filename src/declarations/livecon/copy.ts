/**
 * Copy of the livecon surfaces
 * @type {Record<string, string>}
 */

export const LIVECON_COPY = {
  title: 'Livecon',
  lead: 'Le niveau de vigilance en cours, YouTubeur par YouTubeur. Plus le niveau est bas, plus la situation est tendue.',
  currentTitle: 'Niveaux en cours',
  levelsTitle: 'Les niveaux',
  historyTitle: 'Historique',
  change: 'Changer le niveau',
  changeTitle: 'Changer le livecon',
  global: 'Toute l’équipe',
  since: 'depuis',
  by: 'par',
  emptyTitle: 'Aucun niveau déclaré',
  emptyDescription: 'Crée les niveaux de vigilance dans la configuration pour activer le livecon.',
  emptyStateTitle: 'Aucun niveau en cours',
  emptyStateDescription: 'Choisis un niveau pour ouvrir la surveillance.',
  historyEmptyTitle: 'Aucun changement',
  historyEmptyDescription: 'Les bascules de niveau s’enregistrent ici.',
  guidelines: 'Consignes',
  noGuidelines: 'Aucune consigne écrite pour ce niveau.',
  configure: 'Ouvrir la configuration',
} as const

/**
 * Labels of the livecon form
 * @type {Record<string, string>}
 */

export const LIVECON_FIELD_COPY = {
  youtuber: 'YouTubeur',
  youtuberHint: 'Laisse vide pour appliquer à toute l’équipe.',
  level: 'Niveau',
  reason: 'Motif',
  reasonHint: 'Ce que l’équipe doit savoir sur la bascule.',
} as const
