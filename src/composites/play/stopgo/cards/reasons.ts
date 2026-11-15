import { STOPGO_CARDS, STOPGO_HAZARDS } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_ERRORS } from '@/declarations/play/stopgo/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'

type Player = StopGoBoardView['players'][number]

/**
 * Words telling why a card waits, the server stays the only judge
 * @param {StopGoCardKey} key - Card
 * @param {Player} me - Player's own car
 * @param {number} target - Race distance
 * @return {string} - Reason
 */

export const reasonOf = (key: StopGoCardKey, me: Player, target: number): string => {
  const spec = STOPGO_CARDS[key]

  const km = spec.km
  if (km !== undefined) {
    if (!me.isMoving) return STOPGO_ERRORS.stopped
    if (me.isLimited && km > STOPGO_SETTINGS.limitMaxKm) return STOPGO_ERRORS.limited
    if (me.km + km > target) return STOPGO_ERRORS.overshoot
  }
  if (key === 'green' && me.isMoving) return STOPGO_ERRORS.alreadyGreen
  if (spec.family === 'remedy' && spec.hazard && !me.hazards.includes(spec.hazard)) {
    return STOPGO_ERRORS.noHazard
  }
  if (spec.family === 'attack' || key === 'mystery') return STOPGO_ERRORS.noOpponent

  return STOPGO_HAND_COPY.notYet
}

/**
 * Card lifting a malus
 * @param {string} hazard - Malus
 * @return {StopGoCardKey} - Remedy card
 */

export const remedyOf = (hazard: string): StopGoCardKey =>
  STOPGO_HAZARDS[hazard as keyof typeof STOPGO_HAZARDS].remedy
