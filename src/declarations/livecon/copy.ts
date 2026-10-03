/**
 * Copy of the livecon surfaces
 * @type {Record<string, string>}
 */

export const LIVECON_COPY = {
  title: 'Livecon',
  gaugeLabel: 'Niveau de livecon',
  switchTo: 'Passer au {level}',
  changeTitle: 'Changer le livecon',
  historyTitle: 'Historique du livecon',
  historyEmpty: 'Aucun changement pour le moment.',
  global: 'Toute l’équipe',
  guidelines: 'Consignes',
} as const

/**
 * Labels of the livecon form
 * @type {Record<string, string>}
 */

export const LIVECON_FIELD_COPY = {
  youtuber: 'YouTubeur',
  level: 'Niveau',
  reason: 'Motif',
} as const
