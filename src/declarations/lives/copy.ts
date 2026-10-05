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
  emptyDescription:
    'Un live annoncé apparaît ici, et la page Live en cours s’allume pour l’équipe.',
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
  instructions: 'Consignes',
  instructionsHint:
    'Ce que l’équipe lit avant d’ouvrir la Mod View. Modifiables jusqu’à la fin du live.',
} as const

/**
 * Copy of a live's roll-call board
 * @type {Record<string, string>}
 */

export const LIVE_ROSTER_COPY = {
  title: 'Appel',
  open: 'Voir l’appel',
  close: 'Replier l’appel',
  lead: 'Seuls les lives où un Junior est présent comptent pour sa PIM.',
  leadManage: 'Glisse un pseudo d’une colonne à l’autre, ou clic droit dessus.',
  empty: 'Personne ici',
  moveTo: 'Passer en « {status} »',
  junior: 'Junior',
  loading: 'Chargement de l’appel',
} as const

/**
 * Instructions a live starts with when the announcer leaves none
 * @type {string}
 */

export const LIVE_INSTRUCTIONS_DEFAULT = `- Applique le panel de sanctions du niveau Livecon en vigueur.
- Signale tout doute au Coordinateur du Live avant d’agir.
- Reste présent jusqu’à la fin du live, ou préviens si tu dois partir.`

/**
 * Copy of the page of one live
 * @type {Record<string, string>}
 */

export const LIVE_PAGE_COPY = {
  instructionsTitle: 'Consignes du live',
  instructionsLead: 'À lire avant d’ouvrir la Mod View.',
  instructionsEmpty: 'Aucune consigne pour ce live.',
  instructionsSaved: 'Consignes enregistrées',
  instructionsEdit: 'Modifier les consignes',
  instructionsSave: 'Enregistrer',
  open: 'J’ai lu, ouvrir la Mod View',
  reread: 'Relire les consignes',
  startedTitle: 'Un Live a débuté !',
  startedBody: 'Le live de {creator} est en cours. L’équipe t’attend dans la Mod View.',
  startedJoin: 'Rejoindre',
  startedDismiss: 'Plus tard',
  presentationTitle: 'Aucun live en cours',
  presentationLead:
    'Quand un Responsable lance un live, cette page passe au rouge et la Mod View s’ouvre ici. Voici à quoi elle ressemble.',
} as const

/**
 * Livecon level the presentation plays at
 * @type {number}
 */

export const DEMO_LEVEL = 3
