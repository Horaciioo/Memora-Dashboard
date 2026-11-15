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
}
