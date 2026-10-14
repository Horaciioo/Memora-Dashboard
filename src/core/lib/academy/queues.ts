import { DECISION_PHASES, REVIEW_DUE_PHASES } from '@/core/lib/academy/parkour'
import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'

/**
 * Junior as the queues read them
 * @typedef {Object} QueueJunior
 * @property {ParkourPhase} phase - Where the junior stands
 * @property {{ id: string } | null} trainer - Trainer in charge
 */

export interface QueueJunior {
  phase: ParkourPhase
  trainer: { id: string } | null
}

/**
 * Juniors a trainer owes a check-in
 * @param {T[]} juniors - Juniors in reach
 * @param {string} viewerId - Member looking
 * @return {T[]} - Their own juniors whose check-in falls due
 */

export const reviewQueue = <T extends QueueJunior>(juniors: T[], viewerId: string): T[] =>
  juniors.filter(
    (junior) => REVIEW_DUE_PHASES.includes(junior.phase) && junior.trainer?.id === viewerId
  )

/**
 * Juniors whose check-in waits on a responsable
 * @param {T[]} juniors - Juniors in reach
 * @return {T[]} - Juniors with a decision to give
 */

export const decisionQueue = <T extends QueueJunior>(juniors: T[]): T[] =>
  juniors.filter((junior) => DECISION_PHASES.includes(junior.phase))

/**
 * Wording of a position in a queue
 * @param {number} index - Position, from zero
 * @param {number} total - Length of the queue
 * @return {string} - Position as read aloud
 */

export const flowStep = (index: number, total: number): string =>
  PARKOUR_COPY.flowStep.replace('{index}', String(index + 1)).replace('{total}', String(total))
