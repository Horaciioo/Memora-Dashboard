/**
 * Copy of the live surfaces
 * @type {Record<string, string>}
 */

export const LIVE_COPY = {
  title: 'Live en cours',
  modViewTab: '{name} - Mod View',
  navLabel: 'Live en cours',
  announce: 'Annoncer un live',
  slotTaken: 'Un live est déjà prévu à ces horaires pour ce créateur.',
  start: 'Lancer le live',
  end: 'Clore le live',
  cancel: 'Annuler le live',
  confirmEnd: 'Clore ce live ? La Mod View se ferme pour toute l’équipe.',
  endedTitle: 'Live clos',
  endedDescription: 'Le bilan du live est prêt. Tu veux le voir maintenant ?',
  seeReport: 'Voir le bilan',
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
  liveNow: '{creator} est {strong} sur {platform}, on le rejoint ?',
  liveNowStrong: 'actuellement en Live',
  reinforceNow: 'Tu as été demandé en renfort pour modérer sur {platform} !',
  liveJoin: 'Rejoindre le live',
  liveSection: 'En direct',
  upcomingSection: 'À venir',
  recentSection: 'Lives passés',
  recentEndedAt: 'Clos à {time}',
  reopen: 'Rétablir le live',
  reopenHint: 'Clos avant la fin prévue',
  reopened: 'Live rétabli',
  plannedAt: 'Prévu à',
  plannedRange: 'Prévu de {from} à {to}',
} as const

/**
 * Labels of the live fields of the calendar form
 * @type {Record<string, string>}
 */

export const LIVE_FIELD_COPY = {
  platform: 'Plateforme',
  coordinator: 'Coordinateur du Live',
  coordinatorRefused:
    'Seuls les Coordinateurs de Live, les Responsables du YouTubeur et les Administrateurs peuvent coordonner.',
  coordinatorGroup: 'Coordinateurs de Live',
  platformSoon: 'Les Lives YouTube ne sont pas encore disponibles sur Memora !',
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
  lead: 'Seuls les lives où un Junior est présent comptent pour sa PIM.',
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
  earlyTitle: 'Ce live n’est pas encore ouvert',
  earlyBody: 'Tu pourras le rejoindre à partir de {time}.',
  overTitle: 'Ce live est terminé',
  overBody: 'Il n’est plus possible de le rejoindre.',
  backToLives: 'Retour aux lives',
  presenceTitle: 'Ta présence sur ce live',
  presencePresent: 'Je suis présent',
  presencePassing: 'Je ne fais que passer, je ne suis pas disponible',
  presenceAnswered: 'Tu as répondu être présent de {from} à {to}.',
  presenceEarly: 'Tu es déjà là ? Tu n’as que répondu présent de {from} à {to}.',
  presenceEdit: 'Modifier mes horaires',
  presenceNow: 'Je modère dès à présent',
  presenceRevise: 'Mes horaires ont totalement changé : Revoir les horaires',
  presencePassingShort: 'Je ne suis que de passage, je ne modère pas',
  presenceUntilTitle: 'Jusqu’à quelle heure ?',
  presenceUntilLead: 'Tu modères à partir de maintenant, jusqu’à l’heure que tu indiques.',
  presenceUntil: 'Jusqu’à',
  presenceUntilConfirm: 'Je modère',
  presenceUntilTag: 'Jusqu’à {to}',
  recapTitle: 'Récap des informations',
  recapLead: 'À lire avant d’ouvrir la Mod View.',
  recapResponsables: 'Responsables sur le coup',
  recapCoordinators: 'Coordinateurs',
  recapLive: 'Live',
  recapNobody: 'Personne pour l’instant',
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
  edit: 'Changer les Coordinateurs',
  editTitle: 'Coordinateurs du Live',
  editSaved: 'Coordinateurs mis à jour',
  title: 'On te propose de coordonner',
  hero: 'On souhaite t’avoir comme Coordinateur de Live !',
  infos: 'Infos du Live',
  leadAnonymous: 'Les Responsables souhaitent t’avoir comme Coordinateur du Live de {creator}.',
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
  availableRange: 'Disponibles de {from} à {to}',
  seatAccepted: 'De {from} à {to}',
  seatDeclined: 'A refusé',
} as const
