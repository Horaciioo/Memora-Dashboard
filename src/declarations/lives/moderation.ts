import type { ModerationKind } from '@prisma/client'

import type { IconName } from '@/declarations/ui/icons'

/**
 * How each gesture of the log reads
 * @type {Record<ModerationKind, { label: string, icon: IconName }>}
 */

export const MODERATION_KINDS: Record<ModerationKind, { label: string; icon: IconName }> = {
  DELETE: { label: 'Suppression', icon: 'modDelete' },
  TIMEOUT: { label: 'Timeout', icon: 'modTimeout' },
  BAN: { label: 'Bannissement', icon: 'modBan' },
  UNBAN: { label: 'Débannissement', icon: 'modUnban' },
  WARN: { label: 'Avertissement', icon: 'modWarn' },
  AUTOMOD_APPROVE: { label: 'AutoMod autorisé', icon: 'automod' },
  AUTOMOD_DENY: { label: 'AutoMod refusé', icon: 'automod' },
  TERM_ADD: { label: 'Terme bloqué ajouté', icon: 'blockedTerms' },
  TERM_REMOVE: { label: 'Terme bloqué retiré', icon: 'blockedTerms' },
  MODE_CHANGE: { label: 'Mode du chat', icon: 'modeSlow' },
  UNBAN_REQUEST_APPROVE: { label: 'Demande de déban acceptée', icon: 'unbanRequest' },
  UNBAN_REQUEST_DENY: { label: 'Demande de déban refusée', icon: 'unbanRequest' },
  MESSAGE_SEND: { label: 'Message dans le chat', icon: 'chat' },
}

/**
 * Copy of the live reports
 * @type {Record<string, string>}
 */

export const LIVE_REPORT_COPY = {
  title: 'Bilan',
  creatorTitle: 'Bilan',
  storyWhenTitle: 'Le live',
  storyTo: 'à',
  storyWhenSpan: 'Il a duré {time}',
  storyTeamTitle: 'L’équipe',
  storyTeamMany: '{count} modérateurs ont veillé sur ton chat',
  storyTeamOne: '1 modérateur a veillé sur ton chat',
  storyTeamNone: 'Personne n’a modéré depuis la Mod View',
  storyChatTitle: 'Sur ton chat',
  storyCalm: 'Le live s’est déroulé sans intervention',
  storyCalmHint: 'Aucune action de Mod. n’a été nécessaire.',
  storyActionsBig: '{count} actions de Mod.',
  storyActionsHint: 'sur {targets} viewers différents',
  storyTimeTitle: 'Temps de veille',
  storyTimeHint: 'd’activité de l’équipe dans la Mod View',
  storyPeakTitle: 'Moment le plus chargé',
  storyPeakBig: 'Vers {time}',
  storyPeakHint: '{count} actions de Mod. en {minutes} minutes',
  creatorKicker: 'Le bilan de ton live',
  teamHeading: 'Bilan de {name} du {day}',
  creatorHeading: 'Bilan créateur de {name} du {day}',
  open: 'Bilan',
  openCreator: 'Bilan {name}',
  pastTitle: 'Lives passés',
  pastEmpty: 'Aucun live terminé pour l’instant.',
  unavailable:
    'Les logs de modération ne sont pas encore activés sur cette base : la migration est à appliquer.',
  actions: 'Actions de Mod.',
  failed: 'Actions de Mod. refusées par la plateforme',
  targets: 'Viewers concernés',
  teamTime: 'Temps actif de l’équipe',
  duration: 'Durée du live',
  timelineTitle: 'Activité au fil du live',
  timelineLead: 'Actions de Mod. par tranche de {minutes} minutes.',
  peak: 'Pic à {time} : {count} actions de Mod.',
  teamTitle: 'Équipe de modération',
  teamLead: 'Qui a modéré ce live, et pendant combien de temps.',
  teamEmpty: 'Personne n’a modéré depuis la Mod View.',
  spanRange: 'De {from} à {to}',
  absent: 'Pas présent du live',
  reinforcement: 'Renfort',
  requestedBy: 'demandé par {name}',
  extra: '+{time} hors de ses horaires',
  moderatorsTitle: 'Par modérateur',
  moderatorsLead: 'Actions de Mod. réussies et temps passé dans la Mod View.',
  outsideMemora: 'Hors Memora',
  active: 'actif',
  modSentence: 'A été actif {active} puis {visible} à l’écran. Il a réalisé au total {actions}',
  modActionsMany: '{count} actions de Mod.',
  modActionsOne: '1 action de Mod.',
  visible: 'à l’écran',
  kindsTitle: 'Par action de Mod.',
  levelsTitle: 'Niveaux Livecon',
  levelsEmpty: 'Aucun changement de niveau pendant le live.',
  logTitle: 'Logs',
  logLead: 'Le fil complet, le plus récent en haut.',
  logEmpty: 'Aucune action de Mod. enregistrée pour ce live.',
  logFilter: 'Modérateur',
  logEveryone: 'Toute l’équipe',
  pending: 'En attente',
  refused: 'Refusé',
  print: 'Imprimer ou exporter en PDF',
  creatorLead:
    'Ce que l’équipe de modération a fait pendant ton live, en clair. Aucun pseudo de viewer ni extrait de message.',
  creatorTeam: 'Modérateurs présents',
  creatorBusy: 'Moment le plus chargé',
  creatorQuiet: 'Le live s’est déroulé sans intervention.',
  creatorLevels: 'Niveau d’alerte',
  readyTitle: 'Bilan prêt',
  creatorWhen:
    'Pendant ton live du {day}, de {start} à {end}, {count} modérateurs ont veillé sur ton chat.',
  creatorWhenOne:
    'Pendant ton live du {day}, de {start} à {end}, un modérateur a veillé sur ton chat.',
  creatorWhenNone: 'Pendant ton live du {day}, de {start} à {end}.',
  creatorActions: 'L’équipe a fait {actions} actions de Mod., qui ont concerné {targets} viewers.',
  creatorTime: 'Au total, l’équipe a été active {time} dans la Mod View.',
  creatorPeak:
    'Le moment le plus chargé est arrivé vers {time}, avec {count} actions de Mod. en {minutes} minutes.',
  creatorLevel: '{name} à partir de {time}',
} as const

/**
 * Colour of each Livecon level on the report frise
 * @type {Record<number, string>}
 */

export const LIVECON_FRISE_COLOURS: Record<number, string> = {
  3: 'var(--color-apple-green)',
  2: 'var(--color-apple-orange)',
  1: 'var(--color-apple-red)',
}

/**
 * Copy of the moderation view of a member's file
 * @type {Record<string, string>}
 */

export const MEMBER_MODERATION_COPY = {
  viewActivity: 'Activité',
  viewModeration: 'Modération',
  views: 'Vue des logs',
  windowTitle: 'Sur les {days} derniers jours',
  windowVisible: 'Temps en Mod View',
  windowActive: 'Temps de modération',
  windowLives: 'Lives rejoints',
  livesTitle: 'Lives modérés',
  empty: 'Aucun live modéré depuis Memora pour l’instant.',
  unavailable: 'Les logs de modération ne sont pas encore activés sur cette base.',
  noGesture: 'Présent, sans action de Mod.',
  activeTime: '{time} de Mod.',
  report: 'Bilan du live',
} as const
