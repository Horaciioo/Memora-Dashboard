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
  red: { name: 'Feu rouge', hint: 'Arrête un adversaire jusqu’à un Feu vert.' },
  limit: {
    name: 'Limitation',
    hint: 'Bride un adversaire à 50 km par carte jusqu’à une Fin de limitation.',
  },
  fuel: { name: 'Panne d’essence', hint: 'Cloue un adversaire jusqu’à une Essence.' },
  flat: { name: 'Crevaison', hint: 'Cloue un adversaire jusqu’à une Roue de secours.' },
  crash: { name: 'Accident', hint: 'Cloue plusieurs adversaires jusqu’à une Réparation.' },
  green: { name: 'Feu vert', hint: 'Démarre, ou lève un Feu rouge.' },
  unlimit: { name: 'Fin de limitation', hint: 'Lève la Limitation.' },
  petrol: { name: 'Essence', hint: 'Répare une Panne d’essence.' },
  spare: { name: 'Roue de secours', hint: 'Répare une Crevaison.' },
  repair: { name: 'Réparation', hint: 'Répare un Accident.' },
  goodDraw: { name: 'Bonne pioche', hint: 'Pioche deux cartes, garde-en une.' },
  siren: { name: 'Gyrophare', hint: 'Roule sans Feu vert et bloque Feu rouge et Limitation.' },
  tank: { name: 'Réservoir blindé', hint: 'Bloque les Pannes d’essence.' },
  tyres: { name: 'Pneus renforcés', hint: 'Bloque les Crevaisons.' },
  ace: { name: 'Pilote d’élite', hint: 'Bloque les Accidents.' },
  mystery: {
    name: 'Pioche mystère',
    hint: 'Scelle une carte chez un adversaire qui a de quoi la révéler.',
  },
}

/**
 * Refusal messages
 * @type {Record<StopGoRefusal, string>}
 */

export const STOPGO_ERRORS: Record<StopGoRefusal, string> = {
  notSeated: 'Tu n’es pas dans cette course.',
  stopped: 'Ta voiture est à l’arrêt.',
  noHazard: 'Rien à réparer ici.',
  limited: 'Tu es limité à 50 km par carte.',
  overshoot: 'Il faut arriver pile sur la distance.',
  alreadyGreen: 'Tu roules déjà.',
  noOpponent: 'Aucun adversaire à viser.',
  wrongTargetCount: 'Choisis une seule cible.',
  tooFewTargets: 'Choisis plus d’adversaires.',
  badTarget: 'Cette cible n’est pas valable.',
  alreadyHit: 'Cet adversaire subit déjà ce malus.',
  alreadyStopped: 'Cet adversaire est déjà à l’arrêt, il doit d’abord réparer.',
  shielded: 'Cet adversaire est protégé contre ce malus.',
  alreadyLaid: 'Cette protection est déjà posée.',
  noCounter: 'Tu n’as pas la protection qui pare cette attaque.',
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
  sameMalus: 'Cet adversaire vient déjà de subir ce malus.',
  alreadyDrawn: 'Tu as déjà pioché ce tour.',
  mustDraw: 'Pioche d’abord ta carte du tour.',
  tooShort: 'Cet adversaire n’a pas assez de km pour payer la révélation.',
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
  safeties: 'Immunités',
  safetiesHint:
    'Quatre protections se piochent : posée, chacune immunise pour toute la course contre un type de malus.',
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
  draw: 'Pioche',
  drawValue:
    'À ton tour, tu prends toi-même ta carte sur la pioche avant de jouer. {share} % des cartes tirées sont des cartes de distance.',
  distances: 'Cartes de distance',
  distancesValue: '{list} km. Tu en poses une par tour.',
  finish: 'Arrivée',
  finishValue: 'Il faut arriver pile sur la distance, sans la dépasser.',
  attacks: 'Attaques',
  attacksValue: '{list}. Chaque adversaire subit un seul malus de chaque type.',
  sameMalus: 'Même malus',
  sameMalusValue:
    'Un adversaire ne subit jamais deux fois d’affilée le même malus, même réparé entre-temps.',
  limit: 'Limitation',
  limitValue: 'Tu ne peux plus poser que {km} km par carte.',
  accident: 'Accident',
  accidentValue: 'Il vise au moins {count} adversaires, tous ceux de la table s’il y en a moins.',
  remedies: 'Réparations',
  remediesValue: '{list}. Chacune lève le malus qui lui correspond.',
  goodDraw: 'Bonne pioche',
  goodDrawValue: 'Tu pioches deux cartes, tu en gardes une, {seconds} s pour choisir.',
  mystery: 'Pioche mystère',
  mysteryValue:
    'Une carte scellée chez un adversaire qui a au moins {cost} km. Elle prend une place de sa main jusqu’à ce qu’il la révèle contre {cost} km.',
  safeties: 'Protections',
  safetiesValue:
    '{list}. Elles se piochent comme les autres cartes, toujours une seule de chaque. Posée à ton tour, une protection lève le malus qu’elle bloque, te protège pour toute la course et te fait repiocher puis rejouer.',
  counter: 'Parade éclair',
  counterValue:
    'Si on t’attaque alors que tu gardes en main la protection qui correspond, tu as {seconds} s pour la poser : l’attaque tombe, tu joues juste après et tu pioches en premier. Rien n’indique qui en détient une.',
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
  noTarget: 'Aucun adversaire ne peut la subir maintenant.',
  waitTurn: 'Au tour de {name}.',
  yourTurn: 'À toi de jouer.',
  turnSplash: 'C’est ton tour !',
  hitTitle: 'Tu subis : {name}',
  stepDraw: 'Pioche une carte',
  stepPlay: 'Joue ou défausse une carte',
  stepWait: 'Au tour de {name}',
  pile: 'Pioche',
  draw: 'Piocher',
  drawHint: 'Prends ta carte du tour (Espace).',
  drawFirst: 'Pioche d’abord ta carte du tour.',
  lightGreen: 'Feu vert',
  lightRed: 'Feu rouge',
  lightBroken: 'En panne',
  noMalus: 'Aucun malus',
  fold: 'Plier',
  unfold: 'Déplier',
  close: 'Fermer',
  inPlay: 'Sur ta voiture',
  nothingInPlay: 'Rien pour l’instant',
  discardPile: 'Cartes jouées',
  empty: 'Vide',
  sealed: 'Carte scellée',
  sealedHint:
    'Une carte piégée : elle prend une place de ta main tant qu’elle est scellée. La révéler te coûte {cost} km.',
  mysteryCard: 'Carte mystère',
  mysteryHint: 'Carte scellée : la révéler te coûte des km, à ton tour.',
  reveal: 'Révéler (−{cost} km)',
  revealAfter: 'Tu reculeras à {km} km.',
  pickLead: 'Bonne pioche',
  pickHint: 'Garde une carte, l’autre rejoint les cartes jouées.',
  pickOther: '{name} choisit une carte.',
  keep: 'Garder',
  counterLead: 'Attaque sur toi',
  counterText: '{name} te vise avec {card}.',
  counter: 'Parade éclair',
  noCounter: 'Tu n’as aucune parade en main.',
  letPass: 'Garder ma carte',
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
  SAFETY: '*a posé* {card} et rejoue',
  COUNTER: '*a paré* l’attaque de {others} avec {card}',
  GOOD_DRAW: '*a pioché* deux cartes et en a gardé une',
  MYSTERY: '*a glissé* une carte scellée chez {others}',
  REVEAL: '*a révélé* la carte scellée et perd {km} km',
  DISCARD: '*a défaussé* {card}',
  TIMEOUT: '*a manqué* son tour',
  SHUFFLE: '*a remélangé* les cartes jouées dans la pioche',
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
