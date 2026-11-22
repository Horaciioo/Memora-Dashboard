import {
  CONCORDAT_RANDOM_STYLE,
  ConcordatDifficulties,
  ConcordatModes,
  ConcordatSizes,
  ConcordatSpeeds,
  ConcordatStyles,
} from '@/utils/constants/concordat'
import type {
  ConcordatDifficultyName,
  ConcordatStyleChoice,
  ConcordatModeName,
  ConcordatSizeName,
  ConcordatSpeedName,
  ConcordatStyleName,
} from '@/utils/constants/concordat'

/**
 * Concordat setup drawer words
 * @type {Record<string, string>}
 */

export const CONCORDAT_SETUP_COPY = {
  title: 'Nouvelle partie de Concordat',
  tabs: 'Réglages de la partie',
  tabGame: 'Partie',
  tabMap: 'Carte',
  tabPace: 'Rythme',
  tabWeapons: 'Armes',
  weapons: 'Armes autorisées',
  weaponsHint: 'Les armes décochées sont interdites pour tous les joueurs de la partie.',
  allWeapons: 'Toutes',
  noWeapons: 'Aucune',
  size: 'Taille de la carte',
  sizeHint: 'Une grande carte laisse plus de place, mais la partie dure plus longtemps.',
  style: 'Région du monde',
  styleHint: 'La région décide des voisins, des détroits et des îles.',
  difficulty: 'Comportement de l’IA',
  difficultyHint:
    'Passive : les pays et les tribus avancent lentement. Agressive : ils attaquent vite et fort. Équilibrée : entre les deux.',
  speed: 'Vitesse',
  speedHint: 'Toute la partie, troupes et conquêtes, tourne plus ou moins vite.',
  duration: 'Durée',
  durationHint:
    'Au bout du temps, le meilleur score gagne. Illimitée, la partie dure jusqu’à une victoire.',
  unlimited: 'Illimitée',
  randomMark: '?',
  limited: 'Limitée',
  mode: 'Format',
  modeHint: 'Chacun pour soi, en équipes, en équipes qui changent, classé ou détendu.',
  teams: 'Équipes',
  teamsHint: 'Nombre d’équipes tirées au sort au départ.',
  teamCount: '{count} équipes',
  minutes: '{minutes} min',
  startTroops: 'Troupes de départ',
  startTroopsHint: 'Les troupes de chaque joueur au début de la partie.',
  troopsValue: '{troops} K',
  protection: 'Protection de départ',
  protectionHint: 'Pendant ce temps, personne ne peut attaquer un autre joueur.',
  noProtection: 'Aucune',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la partie',
  cancel: 'Annuler',
} as const

/**
 * Concordat rules drawer words
 * @type {Record<string, string>}
 */

export const CONCORDAT_RULES_COPY = {
  title: 'Règles de la partie',
  map: 'Carte',
  weapons: 'Armes',
  speed: 'Vitesse',
  duration: 'Durée',
  protection: 'Protection de départ',
  start: 'Départ',
  startValue:
    'Pose ta nation où tu veux sur une terre libre pendant {seconds} secondes, puis agrandis-la d’un clic : les pays et les tribus autour grandissent aussi.',
  attack: 'Attaque',
  attackValue:
    'Un clic envoie une part de tes troupes, rappuie pour en renvoyer autant : tout le contact avec la cible avance, plus vite quand le front est long.',
  trade: 'Commerce',
  tradeValue:
    'Tes ports envoient seuls des cargos vers tes autres ports et ceux de tes alliés : chaque arrivée rapporte de l’or aux deux camps, plus la route est longue, et le commerce entre alliés rapporte 60 % de plus. Une alliance rompue ou un navire de guerre ennemi coupe la route. Entre alliés, les marchés se relient par des lignes, les troupes grandissent 30 % plus vite, et tu peux envoyer des renforts (un dixième se perd en route).',
  mode: 'Format',
  win: 'Victoire',
  winValue:
    'Tenir {share} % des terres, seul ou avec ses alliés, fait gagner. Ce seuil baisse avec le temps jusqu’à {end} % et il faut le garder quelques secondes. Un pays trop grand se fait des ennemis, les petits États finissent absorbés. Sinon, le meilleur score gagne au bout du temps : territoire, économie, accomplissements.',
} as const

/**
 * Map size labels
 * @type {Record<ConcordatSizeName, string>}
 */

export const CONCORDAT_SIZE_LABELS: Record<ConcordatSizeName, string> = {
  [ConcordatSizes.Small]: 'Petite',
  [ConcordatSizes.Medium]: 'Moyenne',
  [ConcordatSizes.Large]: 'Grande',
}

/**
 * Map shape labels
 * @type {Record<ConcordatStyleName, string>}
 */

export const CONCORDAT_STYLE_LABELS: Record<ConcordatStyleName, string> = {
  [ConcordatStyles.World]: 'Monde',
  [ConcordatStyles.Europe]: 'Europe',
  [ConcordatStyles.Asia]: 'Asie',
  [ConcordatStyles.Africa]: 'Afrique',
  [ConcordatStyles.Americas]: 'Amériques',
  [ConcordatStyles.Mediterranean]: 'Méditerranée',
  [ConcordatStyles.Oceania]: 'Océanie',
}

/**
 * Region labels with the random draw
 * @type {Record<ConcordatStyleChoice, string>}
 */

export const CONCORDAT_STYLE_CHOICE_LABELS: Record<ConcordatStyleChoice, string> = {
  ...CONCORDAT_STYLE_LABELS,
  [CONCORDAT_RANDOM_STYLE]: 'Aléatoire',
}

/**
 * Difficulty labels
 * @type {Record<ConcordatDifficultyName, string>}
 */

export const CONCORDAT_DIFFICULTY_LABELS: Record<ConcordatDifficultyName, string> = {
  [ConcordatDifficulties.Easy]: 'Passive',
  [ConcordatDifficulties.Normal]: 'Équilibrée',
  [ConcordatDifficulties.Hard]: 'Agressive',
}

/**
 * Speed labels
 * @type {Record<ConcordatSpeedName, string>}
 */

export const CONCORDAT_SPEED_LABELS: Record<ConcordatSpeedName, string> = {
  [ConcordatSpeeds.Relaxed]: 'Détendu',
  [ConcordatSpeeds.Normal]: 'Normal',
  [ConcordatSpeeds.Fast]: 'Rapide',
}

/**
 * Refusals a player can read
 * @type {Record<string, string>}
 */

export const CONCORDAT_REFUSALS: Record<string, string> = {
  notPicking: 'Le choix du départ est terminé.',
  badTile: 'Cette case n’existe pas.',
  badTerrain: 'On ne s’installe pas ici.',
  tooSmall: 'Il n’y a pas assez de terre autour.',
  tooClose: 'Un autre départ est trop proche.',
  occupied: 'Un autre bâtiment occupe déjà cette case.',
  notInGame: 'Tu ne joues pas cette partie.',
  ended: 'La partie est terminée.',
  notPlaying: 'La partie n’a pas commencé.',
  badPercent: 'Choisis un pourcentage entre 1 et 100.',
  self: 'Tu ne peux pas t’attaquer toi-même.',
  badTarget: 'Cette cible n’est plus en jeu.',
  protected: 'Cette nation est encore protégée.',
  tooFew: 'Pas assez de troupes pour engager.',
  noContact: 'Aucune frontière commune avec cette cible.',
  tooManyCorps: 'Trop de corps engagés en même temps.',
  noCorps: 'Aucun corps à rappeler.',
  rate: 'Trop de commandes à la fois.',
  featureOff: 'Cette règle est coupée dans ce format.',
  teamMate: 'On n’attaque pas son équipe.',
  noFeint: 'Tu n’as pas appris la feinte.',
  badPath: 'Cette voie n’existe pas.',
  researching: 'Une recherche est déjà en cours.',
  pathDone: 'Cette voie est terminée.',
  noGold: 'Pas assez d’or.',
  needsZones: 'Conquiers d’abord plus de zones.',
  tooEarly: 'Les armes stratégiques ne sont pas encore disponibles.',
  noSilo: 'Il faut un silo en service.',
  outOfRange: 'La cible est hors de portée.',
  noBattery: 'Il faut une batterie d’artillerie en service.',
  cooling: 'La batterie recharge.',
  noBase: 'Il faut une base aérienne en service.',
  noSlot: 'Ton ciel est plein : attends qu’un appareil rentre.',
  notYours: 'Un hélicoptère garde une de tes terres.',
  heliMax: 'Tu as déjà tes hélicoptères en l’air.',
  noMissile: 'Aucun missile en stock.',
  weaponOff: 'Cette arme est interdite dans cette partie.',
  heavyOff: 'L’arme lourde est interdite dans ce format.',
  siloLevel: 'Il faut un silo de niveau 3.',
  heavySpent: 'Ton arme lourde est déjà partie.',
  treaty: 'Un traité te lie à cette nation.',
  storm: 'Une tempête bloque cette zone.',
  fallout: 'Les retombées interdisent de bâtir ici.',
  badKind: 'Ce bâtiment n’existe pas.',
  needsCoast: 'Ce bâtiment se pose sur la côte.',
  notReady: 'Ce bâtiment est encore en chantier.',
  maxLevel: 'Ce bâtiment est au niveau maximum.',
  farZone: 'Cette zone n’est pas à ta portée.',
  unknown: 'Cette commande n’est pas disponible.',
  duplicate: 'Une offre du même genre attend déjà une réponse.',
  tooManyOffers: 'Tu as trop d’offres en attente.',
  alreadyTied: 'Un traité de ce genre vous lie déjà.',
  tooManyAllies: 'Un des deux camps a déjà le maximum d’alliés.',
  badOffer: 'Cette offre n’existe pas.',
  badRequest: 'Cette demande n’est pas valable.',
  hostile: 'Cette nation te considère comme ennemie.',
  noOffer: 'Cette offre n’est plus là.',
  noTreaty: 'Aucun traité ne vous lie.',
  alreadyBreaking: 'La rupture est déjà en cours.',
  tooMuch: 'Tu offres plus que tu ne peux donner.',
  tooManyRoutes: 'Tu as atteint le maximum de routes commerciales.',
  partnerFull: 'Ce partenaire a atteint le maximum de routes.',
  noRoute: 'Aucune route ne relie ces nations.',
  embargoed: 'Un embargo bloque le commerce entre vous.',
  noPort: 'Il faut un port en service.',
  fleetFull: 'Ta flotte est déjà au maximum.',
  noShip: 'Ce navire n’existe plus.',
  noWay: 'Aucune voie maritime jusque là.',
  notAllied: 'Seuls tes alliés reçoivent des renforts.',
  aidCooldown: 'Tes derniers renforts partent à peine, attends un peu.',
  aidSmall: 'Il n’y a pas assez de troupes à envoyer.',
  aidFull: 'Cet allié ne peut pas accueillir plus de troupes.',
}

/**
 * Concordat failures a host can read
 * @type {Record<string, string>}
 */

export const CONCORDAT_ERRORS = {
  mapTooSmall: 'La carte est trop petite pour tant de joueurs. Choisis une carte plus grande.',
  gone: 'La partie n’est pas en cours sur ce serveur.',
  unknownIntent: 'Commande inconnue.',
}

/**
 * Map shape hints
 * @type {Record<ConcordatStyleName, string>}
 */

export const CONCORDAT_STYLE_HINTS: Record<ConcordatStyleName, string> = {
  [ConcordatStyles.World]: 'Toute la Terre, océans et continents.',
  [ConcordatStyles.Europe]: 'Un continent serré, mille frontières.',
  [ConcordatStyles.Asia]: 'Steppes, chaînes géantes et mers intérieures.',
  [ConcordatStyles.Africa]: 'Désert immense, forêts et grands fleuves.',
  [ConcordatStyles.Americas]: 'Deux continents reliés par un isthme.',
  [ConcordatStyles.Mediterranean]: 'Une mer au centre, trois continents autour.',
  [ConcordatStyles.Oceania]: 'Archipels, jungle et un grand continent désert.',
}

/**
 * Speed hints
 * @type {Record<ConcordatSpeedName, string>}
 */

export const CONCORDAT_SPEED_HINTS: Record<ConcordatSpeedName, string> = {
  [ConcordatSpeeds.Relaxed]: 'Le temps de réfléchir.',
  [ConcordatSpeeds.Normal]: 'Le rythme habituel.',
  [ConcordatSpeeds.Fast]: 'Une partie nerveuse.',
}

/**
 * Concordat table words, until the real screen
 * @type {Record<string, string>}
 */

export const CONCORDAT_BOARD_COPY = {
  waiting: 'La partie se prépare.',
  picking: 'Choix du départ',
  playing: 'En cours',
  ended: 'Terminée',
  troops: 'Troupes',
  gold: 'Or',
  tiles: 'Tuiles',
  attack: 'Attaquer à 50 %',
  expand: 'S’étendre à 50 %',
  retreat: 'Rappeler',
  you: 'Toi',
  fallen: 'Éliminée',
}

/**
 * Format labels
 * @type {Record<ConcordatModeName, string>}
 */

export const CONCORDAT_MODE_LABELS: Record<ConcordatModeName, string> = {
  [ConcordatModes.Free]: 'Chacun pour soi',
  [ConcordatModes.Teams]: 'Équipes',
  [ConcordatModes.Rotating]: 'Équipes temporaires',
  [ConcordatModes.Ranked]: 'Compétitif',
  [ConcordatModes.Relaxed]: 'Détendu',
}

/**
 * Format hints
 * @type {Record<ConcordatModeName, string>}
 */

export const CONCORDAT_MODE_HINTS: Record<ConcordatModeName, string> = {
  [ConcordatModes.Free]: 'Tout le monde pour soi, alliances libres.',
  [ConcordatModes.Teams]: 'Des camps fixes, une alliance qui ne casse pas.',
  [ConcordatModes.Rotating]: 'Un nouveau tirage des camps toutes les 8 minutes.',
  [ConcordatModes.Ranked]: 'Sans événements ni arme lourde, pour un classement.',
  [ConcordatModes.Relaxed]: 'Départ protégé, ni armes ni événements, plus de temps.',
}
