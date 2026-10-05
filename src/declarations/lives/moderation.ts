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
  title: 'Bilan du live',
  creatorTitle: 'Bilan pour le créateur',
  open: 'Voir le bilan',
  openCreator: 'Bilan créateur',
  pastTitle: 'Lives passés',
  pastEmpty: 'Aucun live terminé pour l’instant.',
  unavailable:
    'Les logs de modération ne sont pas encore activés sur cette base : la migration est à appliquer.',
  actions: 'Gestes de modération',
  failed: 'Gestes refusés par la plateforme',
  targets: 'Viewers concernés',
  teamTime: 'Temps actif de l’équipe',
  duration: 'Durée du live',
  timelineTitle: 'Activité au fil du live',
  timelineLead: 'Gestes par tranche de {minutes} minutes.',
  peak: 'Pic à {time} : {count} gestes',
  moderatorsTitle: 'Par modérateur',
  moderatorsLead: 'Gestes réussis et temps passé dans la Mod View.',
  outsideMemora: 'Hors Memora',
  active: 'actif',
  visible: 'à l’écran',
  kindsTitle: 'Par geste',
  levelsTitle: 'Niveaux Livecon',
  levelsEmpty: 'Aucun changement de niveau pendant le live.',
  logTitle: 'Logs',
  logLead: 'Le fil complet, le plus récent en haut.',
  logEmpty: 'Aucun geste enregistré pour ce live.',
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
  creatorActions:
    'L’équipe a fait {actions} gestes de modération, qui ont concerné {targets} viewers.',
  creatorTime: 'Au total, l’équipe a été active {time} dans la Mod View.',
  creatorPeak:
    'Le moment le plus chargé est arrivé vers {time}, avec {count} gestes en {minutes} minutes.',
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
  hours: 'Heures de live sur {days} jours',
  livesTitle: 'Lives modérés',
  empty: 'Aucun live modéré depuis Memora pour l’instant.',
  unavailable: 'Les logs de modération ne sont pas encore activés sur cette base.',
  noGesture: 'Présent, sans geste',
  activeTime: '{time} actif',
  report: 'Bilan du live',
} as const
