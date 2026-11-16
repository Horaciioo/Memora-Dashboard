import { ConcordatTargetActions, ConcordatTies } from '@/utils/constants/concordat'
import type {
  ConcordatBuildingKind,
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
  landLockedTitle: 'Plus de voisin par terre',
  landLockedHint: 'Construis un port, puis envoie tes troupes par la mer vers une autre terre.',
  pickClock: 'Départ dans {seconds} s',
  engage: 'Engagement',
  engageHint: 'Part de tes troupes envoyée à chaque clic.',
  engageValue: '{percent} %',
  corps: 'Mes corps',
  noCorps: 'Aucun corps engagé.',
  free: 'Terre libre',
  freeCorps: 'Terre libre',
  retreat: 'Rappeler',
  offers: 'Propositions',
  accept: 'Accepter',
  refuse: 'Refuser',
  recenter: 'Revenir à ma nation',
  meter: 'Vitesse de la partie',
  meterSpeed: 'Vitesse',
  meterFrames: 'Affichage',
  meterTicks: '{value} tick/s',
  meterFps: '{value} i/s',
  meterNone: '...',
  meterSlow: 'La partie ralentit, la connexion ou le serveur peine.',
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
  shell: 'Obus',
  rocket: 'Roquettes',
  heli: 'Hélicoptère',
  fighter: 'Chasseur',
  noBattery: 'Aucune batterie à portée',
  noBase: 'Aucune base aérienne libre',
  toolSortie: 'Choisis où envoyer le {name}',
  toolGuard: 'Choisis une de tes terres à garder',
  confirmSortie: 'Envoyer',
  stock: '{count} en stock',
  heavyOnce: 'Un seul tir',
  goldCost: '{gold} or',
  zoneWon: '{zone} conquis !',
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
  post: 'un poste de défense',
  sam: 'une batterie antiaérienne',
  airbase: 'une base aérienne',
  battery: 'une batterie d’artillerie',
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
  post: 'Poste de défense',
  sam: 'Antiaérienne',
  airbase: 'Base aérienne',
  battery: 'Artillerie',
}

/**
 * What each weapon does, shown on hover
 * @type {Record<string, string>}
 */

export const CONCORDAT_ARM_HINTS: Record<string, string> = {
  market: 'Rapporte de l’or en continu. Améliorable jusqu’au niveau 3.',
  barracks: 'Augmente le plafond de troupes et leur croissance.',
  fortress: 'Renforce la défense des terres voisines.',
  port: 'Permet d’envoyer des navires de guerre. Sur la côte uniquement.',
  silo: 'Nécessaire pour tirer des missiles à portée. Stocke des munitions.',
  observatory: 'Calme les tensions et la méfiance autour de toi.',
  post: 'Petit poste bon marché : renforce la défense d’une petite zone et tire sur les appareils proches.',
  sam: 'Antiaérienne et antimissile : abat les missiles et les roquettes avant l’impact, et tire sur les appareils ennemis. Un tir à la fois, puis il recharge.',
  airbase:
    'Envoie des hélicoptères et des chasseurs. Chaque niveau ajoute un appareil dans le ciel.',
  battery:
    'Tire obus et roquettes à moyenne portée, sans silo. Recharge entre deux tirs. Les antiaériennes arrêtent les roquettes, pas les obus.',
  shell:
    'Obus d’artillerie : petite zone, tir rapide et bon marché. Il faut une batterie à portée.',
  rocket:
    'Salve de roquettes : zone moyenne, plus coûteuse. Une antiaérienne peut les intercepter.',
  heli: 'Hélicoptère de combat défensif : tourne au-dessus d’une de tes terres et ralentit l’avance ennemie dans la zone. Vulnérable aux chasseurs et à la défense.',
  fighter:
    'Chasseur : fonce sur une cible, mitraille les troupes et attaque les appareils croisés. Revient seul à sa base.',
  missile:
    'Frappe une zone : tue des troupes, secoue la stabilité et laisse des retombées. Il faut un silo à portée.',
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
  [ConcordatTargetActions.Aid]: 'Envoyer des renforts',
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
  sortie: '*a envoyé* un chasseur sur {victim}',
  shotDown: '*a abattu* un appareil de {victim}',
  researched: '*a terminé* une recherche',
  built: '*a bâti* un édifice',
  domination: '*domine* la carte',
  dominationLost: 'La domination est brisée',
  started: 'La conquête commence',
  ended: 'La partie est terminée',
  collapse: '{victim} s’effondre',
  revolt: 'Révolte chez {victim}',
  teamsDrawn: 'Les équipes sont tirées',
  sunk: 'Un transport de {victim} est coulé',
  intercepted: 'Un missile est intercepté',
  warning: '{victim} vacille',
  worldAnnounce: 'Un événement mondial approche',
  worldEnd: 'L’événement mondial prend fin',
  threat: '*attaque* {victim}',
  offerPeace: '*propose* la paix à {victim}',
  offerAlliance: '*propose* une alliance à {victim}',
  offerTrade: '*propose* du commerce à {victim}',
  offerRequest: '*fait* une demande à {victim}',
  offerCoalition: '*propose* une coalition à {victim}',
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

/**
 * Standings table words, short headers with a longer hint
 * @type {Record<string, string>}
 */

export const CONCORDAT_STANDINGS_COPY = {
  title: 'Classement',
  rank: '#',
  name: 'Nation',
  columns: 'Colonnes',
  hide: 'Replier le classement',
  show: 'Déplier le classement',
  kind: 'Type',
  tiles: 'Terres',
  gold: 'Or',
  troops: 'Troupes',
  income: 'Revenu',
  trade: 'Commerce',
  maxTroops: 'Max',
  betrayals: 'Trahisons',
  markets: 'Marchés',
  barracks: 'Casernes',
  forts: 'Forts',
  ports: 'Ports',
  ships: 'Navires',
  zones: 'Zones',
  stability: 'Stabilité',
  allies: 'Alliés',
  silos: 'Silos',
  sams: 'Antiaér.',
  bases: 'Bases',
  kindHuman: 'Joueur',
  kindCountry: 'Pays',
  hintTiles: 'Part de la carte tenue',
  hintGold: 'Or en réserve',
  hintIncome: 'Or gagné par minute, charges déduites',
  hintTrade: 'Or par minute venu du commerce',
  hintTroops: 'Troupes actuelles',
  hintMaxTroops: 'Plafond de troupes',
  hintBetrayals: 'Traités ou alliances trahis',
  hintMarkets: 'Marchés tenus',
  hintBarracks: 'Casernes tenues',
  hintForts: 'Forteresses et postes de défense',
  hintPorts: 'Ports tenus',
  hintShips: 'Navires de guerre',
  hintSilos: 'Silos tenus',
  hintZones: 'Zones conquises',
  hintSams: 'Batteries antiaériennes',
  hintBases: 'Bases aériennes',
  goTo: 'Aller sur {name}',
} as const

/**
 * Card of the nation under the pointer
 * @type {Record<string, string>}
 */

export const CONCORDAT_HOVER_COPY = {
  human: 'Joueur',
  country: 'Pays',
  tribe: 'Tribu',
  ships: 'Navires de guerre',
  sending: 'Troupes envoyées à l’attaque',
  troopsOf: '{troops} troupes sur {max}',
} as const
