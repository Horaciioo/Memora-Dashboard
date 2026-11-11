/**
 * Days a figure of the Live hub covers, and how many lives are listed
 * @type {{ periodDays: number, recentCount: number }}
 */

export const LIVE_HUB = {
  periodDays: 30,
  recentCount: 5,
  messageKind: 'MESSAGE_SEND',
} as const

/**
 * Recent Live figures
 * @type {Record<string, { icon: IconName, label: string }>}
 */

export const LIVE_HUB_METRICS = {
  sanctions: { icon: 'modActions', label: 'Sanctions effectuées' },
  messages: { icon: 'chat', label: 'Messages envoyés' },
  time: { icon: 'clock', label: 'Temps de modération' },
} as const satisfies Record<string, { icon: IconName; label: string }>

/**
 * Glyph of each figure
 * @type {Record<LiveHubFigure['key'], IconName>}
 */

export const LIVE_HUB_FIGURE_ICONS = {
  infractions: 'modActions',
  time: 'clock',
  messages: 'chat',
  lives: 'stream',
  moderators: 'crowd',
} as const satisfies Record<string, IconName>

/**
 * Copy of the personal Live hub
 * @type {Record<string, string>}
 */

export const LIVE_HUB_COPY = {
  title: 'Live',
  creatorLabel: 'Créateur',
  periodNote: '30 derniers jours, comparés aux 30 précédents',
  infractions: 'Infractions traitées',
  time: 'Temps passé à modérer',
  messages: 'Messages envoyés',
  lives: 'Lives modérés',
  moderators: 'Modérateurs actifs',
  personalTitle: 'Tes chiffres',
  teamTitle: 'Toute l’équipe',
  modView: 'Ouvrir la Mod. View',
  trendNew: 'Nouveau',
  nothingPlanned: 'Aucun Live d’annoncé actuellement !',
  onAir: 'En direct',
  upcomingLive: 'Prochain live',
  historyTitle: 'Historique des Lives',
  historyEmpty: 'Aucun live terminé pour l’instant.',
  reinforcement: 'Renfort',
} as const
import type { IconName } from '@/declarations/ui/icons'

/**
 * Lives shown in the history
 * @type {number}
 */

export const LIVE_HISTORY_LIMIT = 4
