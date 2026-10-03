/**
 * Copy of the live surfaces
 * @type {Record<string, string>}
 */

export const LIVE_COPY = {
  title: 'Live en cours',
  navLabel: 'Live en cours',
  announce: 'Annoncer un live',
  announceTitle: 'Annoncer un live',
  announceVerb: 'Annoncer',
  announceLead: 'L’équipe convoquée est prévenue, sauf les membres en absence.',
  start: 'Lancer le live',
  end: 'Clore le live',
  cancel: 'Annuler le live',
  confirmEnd: 'Clore ce live ? La Mod View se ferme pour toute l’équipe.',
  confirmCancel: 'Annuler ce live ? L’équipe convoquée est prévenue.',
  openModView: 'Ouvrir la Mod View',
  modViewLocked: 'La Mod View s’ouvre au lancement du live.',
  emptyTitle: 'Aucun live prévu',
  emptyDescription: 'Un live annoncé apparaît ici, et la page Live en cours s’allume pour l’équipe.',
  startsAt: 'Début prévu',
  endsAt: 'Fin prévue',
  startedAt: 'Lancé à',
  coordinator: 'Coordinateur du Live',
  noCoordinator: 'Aucun coordinateur',
  convened: 'Convoqués',
  answered: 'Présents confirmés',
  urgentLive: 'Live de {creator} en cours',
  urgentAnnounced: 'Live de {creator} prévu le {time}',
  urgentOpen: 'Rejoindre',
  liveBadge: 'En direct',
  announcedBadge: 'Annoncé',
} as const

/**
 * Labels of the announce form
 * @type {Record<string, string>}
 */

export const LIVE_FIELD_COPY = {
  youtuber: 'YouTubeur',
  platform: 'Plateforme',
  title: 'Titre du live',
  titlePlaceholder: 'Ce que le live annonce',
  startsAt: 'Début prévu',
  durationMinutes: 'Durée prévue (minutes)',
  coordinator: 'Coordinateur du Live',
  coordinatorHint: 'Il garde ses droits jusqu’à la fin du live, puis les perd tout seul.',
  members: 'Modérateurs convoqués',
  membersHint: 'Vide : toute l’équipe Lives du YouTubeur. Les absents ne sont jamais convoqués.',
} as const
