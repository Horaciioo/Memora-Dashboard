import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import type { StopGoRefusal } from '@/declarations/play/stopgo/refusals'

/**
 * Card names and phrases
 * @type {Record<StopGoCardKey, { name: string, hint: string }>}
 */

export const STOPGO_CARD_COPY: Record<StopGoCardKey, { name: string; hint: string }> = {
  km25: { name: '25 km', hint: 'Avance de 25 km.' },
  km50: { name: '50 km', hint: 'Avance de 50 km.' },
  km75: { name: '75 km', hint: 'Avance de 75 km.' },
  km100: { name: '100 km', hint: 'Avance de 100 km.' },
  km200: { name: '200 km', hint: 'Avance de 200 km.' },
  red: { name: 'Feu rouge', hint: 'Arrête la voiture d’un adversaire.' },
  limit: { name: 'Limitation', hint: 'Bride un adversaire à 50 km par carte.' },
  fuel: { name: 'Panne d’essence', hint: 'Cloue un adversaire sur place.' },
  flat: { name: 'Crevaison', hint: 'Cloue un adversaire sur place.' },
  crash: { name: 'Accident', hint: 'Cloue plusieurs adversaires à la fois.' },
  green: { name: 'Feu vert', hint: 'Démarre, ou lève un Feu rouge.' },
  unlimit: { name: 'Fin de limitation', hint: 'Lève la Limitation.' },
  petrol: { name: 'Essence', hint: 'Répare une Panne d’essence.' },
  spare: { name: 'Roue de secours', hint: 'Répare une Crevaison.' },
  repair: { name: 'Réparation', hint: 'Répare un Accident.' },
  goodDraw: { name: 'Bonne pioche', hint: 'Pioche deux cartes, garde-en une.' },
  mystery: { name: 'Pioche mystère', hint: 'Glisse une carte scellée chez un adversaire.' },
}

/**
 * Refusal messages
 * @type {Record<StopGoRefusal, string>}
 */

export const STOPGO_ERRORS: Record<StopGoRefusal, string> = {
  notSeated: 'Tu n’es pas dans cette course.',
  stopped: 'Ta voiture est à l’arrêt.',
  limited: 'Tu es limité à 50 km par carte.',
  overshoot: 'Il faut arriver pile sur la distance.',
  alreadyGreen: 'Tu roules déjà.',
  noHazard: 'Rien à réparer ici.',
  noOpponent: 'Aucun adversaire à viser.',
  wrongTargetCount: 'Choisis une seule cible.',
  tooFewTargets: 'Choisis plus d’adversaires.',
  badTarget: 'Cette cible n’est pas valable.',
  alreadyHit: 'Cet adversaire subit déjà ce malus.',
  jokerSpent: 'Ce Joker est déjà utilisé.',
  nothingToClean: 'Aucun malus à nettoyer.',
  notYourTurn: 'Ce n’est pas ton tour.',
  staleTurn: 'Ce tour est déjà passé.',
  notInHand: 'Cette carte n’est pas dans ta main.',
  raceOver: 'La course est terminée.',
  notYet: 'Cette carte n’est pas encore jouable.',
  waiting: 'Une attaque attend encore une réponse.',
  noWindow: 'Aucune attaque ne te vise.',
  alreadySealed: 'Cet adversaire porte déjà une carte scellée.',
  noSealed: 'Aucune carte scellée à révéler.',
  pileEmpty: 'La pioche est vide.',
  notPicking: 'Aucune pioche en cours.',
}

/**
 * Setup drawer of a new Stop & Go race
 * @type {Record<string, string>}
 */

export const STOPGO_SETUP_COPY = {
  title: 'Nouvelle course Stop & Go',
  tabs: 'Réglages de la course',
  tabRules: 'Règles',
  target: 'Distance de la course',
  targetHint: 'Il faut arriver pile sur la distance choisie.',
  km: '{km} km',
  turnSeconds: 'Temps par tour',
  turnSecondsHint: 'Un tour dépassé défausse la carte piochée.',
  seconds: '{seconds} s',
  less: 'Moins',
  more: 'Plus',
  create: 'Créer la course',
  cancel: 'Annuler',
} as const

/**
 * Rules drawer of a Stop & Go race
 * @type {Record<string, string>}
 */

export const STOPGO_RULES_COPY = {
  title: 'Règles de la course',
  target: 'Distance',
  turnSeconds: 'Temps par tour',
  start: 'Départ',
  startStopped: 'Tu démarres à l’arrêt, il te faut un Feu vert.',
  startRolling: 'Tu démarres déjà en roulant.',
  distances: 'Cartes de distance',
  distancesValue: '{list} km. Tu en poses une par tour.',
  finish: 'Arrivée',
  finishValue: 'Il faut arriver pile sur la distance, sans la dépasser.',
  attacks: 'Attaques',
  attacksValue: '{list}. Chaque adversaire subit un seul malus de chaque type.',
  limit: 'Limitation',
  limitValue: 'Tu ne peux plus poser que {km} km par carte.',
  accident: 'Accident',
  accidentValue: 'Il vise au moins {count} adversaires, tous ceux de la table s’il y en a moins.',
  remedies: 'Réparations',
  remediesValue: '{list}. Chacune lève le malus qui lui correspond.',
  goodDraw: 'Bonne pioche',
  goodDrawValue: 'Tu pioches deux cartes, tu en gardes une, {seconds} s pour choisir.',
  mystery: 'Pioche mystère',
  mysteryValue: 'Une carte scellée chez un adversaire, qui la révèle contre {cost} km.',
  immunity: 'Joker Immunité',
  immunityValue: 'Annule une attaque qui te vise, {seconds} s pour répondre. Une fois par course.',
  cleanup: 'Joker Grand nettoyage',
  cleanupValue: 'Lève tous tes malus d’un coup. Une fois par course.',
  strikes: 'Tours manqués',
  strikesValue: 'Après {count} tours manqués d’affilée, ton tour ne dure plus que {seconds} s.',
} as const

/**
 * Hand, targets and answers
 * @type {Record<string, string>}
 */

export const STOPGO_HAND_COPY = {
  hand: 'Ta main',
  play: 'Jouer',
  discard: 'Défausser',
  cancel: 'Annuler',
  launch: 'Lancer',
  pickTarget: 'Choisis ta cible',
  pickTargets: 'Choisis au moins {count} cibles',
  notYet: 'Pas jouable maintenant.',
  waitTurn: 'Au tour de {name}.',
  yourTurn: 'À toi de jouer.',
  pile: 'Pioche',
  discardPile: 'Défausse',
  empty: 'Vide',
  sealed: 'Carte scellée',
  sealedHint: 'Une carte piégée. La révéler te coûte {cost} km.',
  reveal: 'Révéler (−{cost} km)',
  revealAfter: 'Tu reculeras à {km} km.',
  pickLead: 'Bonne pioche',
  pickHint: 'Garde une carte, l’autre part à la défausse.',
  pickOther: '{name} choisit une carte.',
  keep: 'Garder',
  immunityLead: 'Attaque sur toi',
  immunityText: '{name} te vise avec {card}.',
  immunity: 'Immunité',
  letPass: 'Laisser passer',
  cleanup: 'Grand nettoyage',
  cleanupHint: 'Lève tous tes malus.',
  jokerReady: 'Prêt',
  jokerSpent: 'Utilisé',
  myCar: 'Ma voiture',
  rolling: 'Tu roules',
  stopped: 'Tu es à l’arrêt',
  rivalRolling: 'Il roule',
  rivalStopped: 'À l’arrêt',
  limited: 'Limité à {km} km par carte',
  noHazard: 'Aucun malus',
  fixedBy: 'Réparé par {card}',
  jokers: 'Jokers',
  you: 'Toi',
  count: '{count} cartes',
} as const

/**
 * HUD card captions
 * @type {Record<string, string>}
 */

export const STOPGO_HUD_COPY = {
  target: 'Distance',
  turn: 'Tour',
  time: 'Temps',
  pile: 'Pioche',
  km: '{km} km',
} as const

/**
 * Feed templates per log kind, the player's name leads and the verb between stars is coloured
 * @type {Record<string, string>}
 */

export const STOPGO_FEED_COPY = {
  DISTANCE: '*a avancé* de {km} km',
  GREEN: '*a démarré* avec un Feu vert',
  ATTACK: '*a lancé* {card} sur {others}',
  REMEDY: '*a réparé* avec {card}',
  IMMUNITY: '*a paré* l’attaque de {others}',
  CLEANUP: '*a nettoyé* tous ses malus',
  GOOD_DRAW: '*a pioché* deux cartes et en a gardé une',
  MYSTERY: '*a glissé* une carte scellée chez {others}',
  REVEAL: '*a révélé* la carte scellée et perd {km} km',
  DISCARD: '*a défaussé* {card}',
  TIMEOUT: '*a manqué* son tour',
  SHUFFLE: '*a remélangé* la défausse dans la pioche',
  FINISH: '*a passé* la ligne d’arrivée',
} as const

/**
 * Result screen of a Stop & Go race
 * @type {Record<string, string>}
 */

export const STOPGO_RESULT_COPY = {
  first: 'Vainqueur · {km} km',
  place: '{place}e · {km} km',
  left: 'Parti · {km} km',
  strip: 'Positions à l’arrivée',
  sealed: 'Cartes scellées restées en main',
} as const
