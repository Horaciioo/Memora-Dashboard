'use client'

import { useLiveBoard } from '@/core/hooks/data/play/useLiveBoard'
import type { LiveBoardShape } from '@/core/hooks/data/play/useLiveBoard'
import { isNewerLudo, toLudoState } from '@/core/lib/play/ludo/state'
import type { LudoBoardState, LudoBoardView } from '@/core/lib/play/ludo/state'

// Ludo reading of a board
const LUDO_SHAPE: LiveBoardShape<LudoBoardView, LudoBoardState> = {
  toState: toLudoState,
  isNewer: isNewerLudo,
}

/**
 * Live Ludo board: server render first, then each move read from the stream
 * @param {string} sessionId - Game
 * @param {LudoBoardView} initial - Board of the page render
 * @return {LudoBoardState} - Newest board
 */

export const useLudoBoard = (sessionId: string, initial: LudoBoardView): LudoBoardState =>
  useLiveBoard(sessionId, initial, LUDO_SHAPE)
