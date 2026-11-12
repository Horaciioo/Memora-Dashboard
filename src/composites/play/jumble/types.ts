import type { jumbleView } from '@/core/services/play/jumble/JumbleViewService'

// Board sent by the engine
export type JumbleBoardView = Awaited<ReturnType<typeof jumbleView>>

export type JumbleSeatView = JumbleBoardView['players'][number]

/**
 * Seat with its face
 * @typedef {Object} JumbleFace
 */

export interface JumbleFace extends JumbleSeatView {
  name: string
  avatarUrl: string | null
}
