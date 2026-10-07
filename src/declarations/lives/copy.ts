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
  coordinators: 'Coordination du Live',
  answered: 'Présents confirmés',
  urgentLive: 'Live de {creator} en cours',
  urgentAnnounced: 'Live de {creator} prévu le {time}',
  urgentOpen: 'Rejoindre',
  liveBadge: 'En direct',
  liveNow: '{creator} est {strong}, on le rejoint ?',
  liveNowStrong: 'actuellement en Live',
  liveJoin: 'Rejoindre le live',
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
  coordinatorHint:
    'Plusieurs possibles. Chacun reçoit une demande et choisit lui-même ses horaires, ses droits courent jusqu’à la fin de son créneau.',
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
  startedBubble: 'Le live a démarré ! On y va ?',
} as const

/**
 * Copy of the coordinator requests
 * @type {Record<string, string>}
 */

export const LIVE_COORDINATION_COPY = {
  title: 'On te propose de coordonner',
  lead: '{asker} souhaite t’avoir comme Coordinateur du Live de {creator}, « {title} ».',
  leadAnonymous:
    'Les Responsables souhaitent t’avoir comme Coordinateur du Live de {creator}, « {title} ».',
  window: 'Live prévu {range}',
  from: 'Je coordonne à partir de',
  to: 'Jusqu’à',
  accept: 'Je coordonne',
  decline: 'Je ne peux pas',
  badWindow: 'Choisis des horaires dans la durée du live.',
  gapRange: 'de {from} à {to}',
  gapAlert: 'Il manque un Coordinateur {ranges}.',
  gapHint: 'Personne ne coordonne encore {ranges}.',
  accepted: 'Tu coordonnes ce live, merci !',
  declined: 'C’est noté, les Responsables sont prévenus.',
  seatAsked: 'Sans réponse',
  seatAccepted: '{from} à {to}',
  seatDeclined: 'A refusé',
} as const
