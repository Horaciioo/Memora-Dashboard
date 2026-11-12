import type { suspensView } from '@/core/services/play/suspens/SuspensViewService'

// Board sent by the engine
export type SuspensBoardView = Awaited<ReturnType<typeof suspensView>>

export type SuspensSeatView = SuspensBoardView['players'][number]

/**
 * Seat with its face
 * @typedef {Object} SuspensFace
 */

export interface SuspensFace extends SuspensSeatView {
  name: string
  avatarUrl: string | null
}
