import { STOPGO_CARDS, STOPGO_HAZARDS } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_ERRORS } from '@/declarations/play/stopgo/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { aimVerdict } from '@/core/lib/play/stopgo'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'

type Player = StopGoBoardView['players'][number]

/**
 * Words telling why an attack has nobody to aim at
 * @param {StopGoCardKey} key - Attack or mystery card
 * @param {Player[]} rivals - Other cars of the race
 * @return {string} - Reason, the common one when every rival is blocked alike
 */

const aimReason = (key: StopGoCardKey, rivals: Player[]): string => {
  const hazard = STOPGO_CARDS[key].hazard
  if (!rivals.length) return STOPGO_ERRORS.noOpponent
  if (!hazard) {
    const isShort = rivals.every((rival) => rival.km < STOPGO_SETTINGS.mysteryCost)

    return isShort ? STOPGO_ERRORS.tooShort : STOPGO_ERRORS.alreadySealed
  }

  // One refusal per rival, shared or not
  const reasons = new Set(
    rivals.map((rival) => {
      const verdict = aimVerdict(hazard, rival)

      return verdict ? STOPGO_ERRORS[verdict] : STOPGO_HAND_COPY.noTarget
    })
  )

  return reasons.size === 1 ? [...reasons][0] : STOPGO_HAND_COPY.noTarget
}

/**
 * Words telling why a card waits, the server stays the only judge
 * @param {StopGoCardKey} key - Card
 * @param {Player} me - Player's own car
 * @param {number} target - Race distance
 * @param {Player[]} rivals - Other cars of the race
 * @return {string} - Reason
 */

export const reasonOf = (
  key: StopGoCardKey,
  me: Player,
  target: number,
  rivals: Player[] = []
): string => {
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
  if (spec.family === 'safety') return STOPGO_ERRORS.alreadyLaid
  if (spec.family === 'attack' || key === 'mystery') return aimReason(key, rivals)

  return STOPGO_HAND_COPY.notYet
}

/**
 * Card lifting a malus
 * @param {string} hazard - Malus
 * @return {StopGoCardKey} - Remedy card
 */

export const remedyOf = (hazard: string): StopGoCardKey =>
  STOPGO_HAZARDS[hazard as keyof typeof STOPGO_HAZARDS].remedy
