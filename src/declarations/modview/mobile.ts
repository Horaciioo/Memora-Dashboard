import type { MobilePageKey } from '@/types/modview'

/**
 * Pages of the phone Mod View in their default order
 * @type {readonly MobilePageKey[]}
 */

export const MODVIEW_MOBILE_PAGES: readonly MobilePageKey[] = ['settings', 'team', 'live', 'feed']

/**
 * Pace of the scrolling information message
 * @type {Record<string, number>}
 */

export const MODVIEW_TICKER = {
  // Slowest and per-character pace of the scrolling message, in seconds
  minSeconds: 10,
  secondsPerChar: 0.18,
} as const

/**
 * Copy of the Mod View on a phone
 * @type {Record<string, string>}
 */

export const MODVIEW_MOBILE_COPY = {
  pageSettings: 'Paramètres',
  pageTeam: 'Chat d’équipe',
  pageLive: 'Live',
  pageFeed: 'Fil d’action',
  unbanPage: 'Débannissements',
  unbanPrevious: 'Demande précédente',
  unbanNext: 'Demande suivante',
  unbanWho: 'Demandes de débannissement',
  unbanReason: 'Raison',
  unbanChat: 'Chat de {name}',
  tickerPinned: 'Épinglé : {text}',
  tickerPoll: 'Sondage : {title}',
  tickerOpen: 'Voir les informations du live',
  pagesSection: 'Emplacement',
  pagesHint: 'Glisse chaque page à l’endroit où tu la veux, de la gauche vers la droite.',
  pagesReset: 'Rétablir par défaut',
  pagesFirst: 'Premier écran',
  pagesLast: 'Dernier écran',
  pagesLabel: 'Pages de la Mod. View',
  leave: 'Quitter la Mod. View',
  tabChat: 'Chat principal',
  tabInfo: 'Informations',
  streamInfo: 'Infos du live',
  viewers: '{count} viewers',
  pinned: 'Épinglé',
  polls: 'Sondages',
  predictions: 'Prédictions',
  noPinned: 'Aucun message épinglé',
  noPoll: 'Aucun sondage en cours',
  noPrediction: 'Aucune prédiction en cours',
  team: 'Équipe',
  teamHere: 'Présents dans la Mod. View',
  feedAutomod: 'Auto-mod',
  feedActions: 'Actions de mod',
  showStream: 'Afficher le flux',
  save: 'Enregistrer',
  cancel: 'Abandonner',
  suggestion: 'Suggestion',
  timeouts: 'Timeouts',
  bans: 'Bans',
  warns: 'Avertissements',
  others: 'Autres mesures',
  none: 'Aucun',
  gestures: 'Actions',
} as const
