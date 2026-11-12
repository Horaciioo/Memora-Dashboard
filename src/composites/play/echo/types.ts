import type { echoView } from '@/core/services/play/echo/EchoViewService'

// Board sent by the engine
export type EchoBoardView = Awaited<ReturnType<typeof echoView>>

export type EchoSeatView = EchoBoardView['players'][number]

/**
 * Seat with its face
 * @typedef {Object} EchoFace
 */

export interface EchoFace extends EchoSeatView {
  name: string
  avatarUrl: string | null
}
