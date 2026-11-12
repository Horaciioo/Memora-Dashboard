import type { glitchView } from '@/core/services/play/glitch/GlitchViewService'

// Board sent by the engine
export type GlitchBoardView = Awaited<ReturnType<typeof glitchView>>

export type GlitchSeatView = GlitchBoardView['players'][number]

/**
 * Seat with its face
 * @typedef {Object} GlitchFace
 */

export interface GlitchFace extends GlitchSeatView {
  name: string
  avatarUrl: string | null
}
