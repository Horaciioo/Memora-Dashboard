import {
  ConcordatOfferKinds,
  ConcordatTargetActions,
  ConcordatTies,
} from '@/utils/constants/concordat'
import type {
  ConcordatBuildingKind,
  ConcordatOfferKind,
  ConcordatTargetAction,
  ConcordatTieKind,
} from '@/utils/constants/concordat'

/**
 * Concordat screen words
 * @type {Record<string, string>}
 */

export const CONCORDAT_HUD_COPY = {
  time: 'Temps',
  tiles: 'Terres',
  troops: 'Troupes',
  gold: 'Or',
  stability: 'Stabilité',
  waiting: 'La partie se prépare.',
  nation: 'Nation {id}',
  pickTitle: 'Choisis ton départ',
  pickHint:
    'Clique sur une terre libre pour poser ta nation. Tu peux le déplacer jusqu’à la fin du compte à rebours.',
  pickSpectator: 'Les nations choisissent leur départ.',
  pickClock: 'Départ dans {seconds} s',
  engage: 'Engagement',
  engageHint: 'Part de tes troupes envoyée à chaque clic.',
  engageValue: '{percent} %',
  corps: 'Mes corps',
  noCorps: 'Aucun corps engagé.',
  free: 'Terre libre',
  freeCorps: 'Terre libre',
  retreat: 'Rappeler',
  threat: 'Attaque de {name}',
  offers: 'Propositions',
  accept: 'Accepter',
  refuse: 'Refuser',
  recenter: 'Revenir à ma nation',
  fit: 'Voir toute la carte',
  minimap: 'Carte du monde',
  rankingKey: 'Classement (Tab)',
  tooltipTiles: '{tiles} terres',
  tooltipTroops: '{troops} troupes',
  fallen: 'Éliminée',
  closeMenu: 'Fermer',
  expandHere: 'S’étendre ici',
  arsenal: 'Arsenal',
  build: 'Bâtir',
  weapons: 'Armes',
  missile: 'Missile',
  heavy: 'Missile lourd',
  stock: '{count} en stock',
  heavyOnce: 'Un seul tir',
  goldCost: '{gold} or',
  zoneWon: '{zone} conquis !',
  zoneGold: '+{gold} or',
  toolBuild: 'Pose {name} sur une de tes terres',
  toolLaunch: 'Choisis une cible pour le {name}',
  toolCancel: 'Échap pour annuler',
  weaponsLocked: 'Armes dans {time}',
  noSilo: 'Aucun silo à portée',
  upgrade: 'Améliorer',
  level: 'Niveau {level}',
  building: 'En construction',
  warship: 'Navire de guerre',
  fire: 'Tirer',
  confirmFire: 'Confirmer le tir',
  cancel: 'Annuler',
  flight: '{seconds} s',
} as const

/**
 * Building names
 * @type {Record<ConcordatBuildingKind, string>}
 */

export const CONCORDAT_BUILDING_LABELS: Record<ConcordatBuildingKind, string> = {
  market: 'un marché',
  barracks: 'une caserne',
  fortress: 'une forteresse',
  port: 'un port',
  silo: 'un silo',
  observatory: 'un observatoire',
}

/**
 * Building names on a button
 * @type {Record<ConcordatBuildingKind, string>}
 */

export const CONCORDAT_BUILDING_TITLES: Record<ConcordatBuildingKind, string> = {
  market: 'Marché',
  barracks: 'Caserne',
  fortress: 'Forteresse',
  port: 'Port',
  silo: 'Silo',
  observatory: 'Observatoire',
}

/**
 * What each weapon does, shown on hover
 * @type {Record<string, string>}
 */

export const CONCORDAT_ARM_HINTS: Record<string, string> = {
  market: 'Rapporte de l’or en continu. Améliorable jusqu’au niveau 3.',
  barracks: 'Augmente le plafond de troupes et leur croissance.',
  fortress: 'Renforce la défense des terres voisines et intercepte les missiles.',
  port: 'Permet d’envoyer des navires de guerre. Sur la côte uniquement.',
  silo: 'Nécessaire pour tirer des missiles à portée. Stocke des munitions.',
  observatory: 'Calme les tensions et la méfiance autour de toi.',
  missile:
    'Frappe une zone : tue des troupes, secoue la stabilité et laisse des retombées. Il faut un silo à portée. Les forteresses peuvent l’intercepter.',
  heavy:
    'Frappe une très grande zone, bien plus destructrice. Un seul tir par partie, silo niveau 3 requis. Plus lent, mais difficile à intercepter.',
} as const

/**
 * Gesture labels of the target menu
 * @type {Record<ConcordatTargetAction, string>}
 */

export const CONCORDAT_ACTION_LABELS: Record<ConcordatTargetAction, string> = {
  [ConcordatTargetActions.Attack]: 'Attaquer',
  [ConcordatTargetActions.Peace]: 'Proposer la paix',
  [ConcordatTargetActions.Alliance]: 'Proposer une alliance',
  [ConcordatTargetActions.Trade]: 'Commercer',
  [ConcordatTargetActions.Break]: 'Rompre le traité',
}

/**
 * Tie labels
 * @type {Record<ConcordatTieKind, string>}
 */

export const CONCORDAT_TIE_LABELS: Record<ConcordatTieKind, string> = {
  [ConcordatTies.Hostile]: 'Aucun traité',
  [ConcordatTies.Peace]: 'En paix',
  [ConcordatTies.Alliance]: 'Alliée',
}

/**
 * Offer labels
 * @type {Record<ConcordatOfferKind, string>}
 */

export const CONCORDAT_OFFER_LABELS: Record<ConcordatOfferKind, string> = {
  [ConcordatOfferKinds.Peace]: 'propose la paix',
  [ConcordatOfferKinds.Alliance]: 'propose une alliance',
  [ConcordatOfferKinds.Trade]: 'propose du commerce',
  [ConcordatOfferKinds.Request]: 'fait une demande',
  [ConcordatOfferKinds.Coalition]: 'propose une coalition',
}

/**
 * Concordat feed lines, the nation's name comes first
 * @type {Record<string, string>}
 */

export const CONCORDAT_FEED_COPY = {
  capitalTaken: '*a pris* la capitale de {victim}',
  eliminated: '*a éliminé* {victim}',
  treaty: '*a signé* un traité avec {victim}',
  broken: '*a rompu* son traité avec {victim}',
  betrayal: '*a trahi* {victim}',
  coalition: '*a rejoint* la coalition contre {victim}',
  landed: '*a débarqué* chez {victim}',
  launched: '*a lancé* un missile sur {victim}',
  impact: '*a frappé* {victim}',
  researched: '*a terminé* une recherche',
  built: '*a bâti* un édifice',
  domination: '*domine* la carte',
  dominationLost: 'La domination est brisée',
  started: 'La conquête commence',
  ended: 'La partie est terminée',
  collapse: '{victim} s’effondre',
  revolt: 'Révolte chez {victim}',
  teamsDrawn: 'Les équipes sont tirées',
} as const

/**
 * Concordat result screen words
 * @type {Record<string, string>}
 */

export const CONCORDAT_RESULT_COPY = {
  first: 'Vainqueur · {percent} % des terres',
  place: '{place}e · {percent} % des terres',
  fallen: 'Éliminée',
  timeline: 'Histoire de la partie',
  timelineHint:
    'Terres tenues par chaque nation. Les repères marquent les traités et les trahisons.',
  treaty: 'Traité',
  betrayal: 'Trahison',
  minute: '{minutes} min',
} as const

/**
 * Tips read on the Concordat loading screen
 * @type {readonly string[]}
 */

export const CONCORDAT_LOADING_TIPS: readonly string[] = [
  'Pose ton pion loin des autres : un départ isolé grandit en paix.',
  'Un front long est fragile. Mieux vaut un seul voisin à la fois.',
  'Une montagne protège, une plaine rapporte. Choisis ce qui te manque.',
  'Pendant la protection de départ, personne ne peut t’attaquer.',
  'Une paix ne dure qu’un temps, une alliance se rompt à ses risques.',
  'Prendre la capitale d’une nation la désorganise.',
  'Les touches 1 à 9 règlent la part de troupes envoyée.',
  'La molette zoome, glisser déplace la carte.',
]
