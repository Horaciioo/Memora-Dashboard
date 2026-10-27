'use client'

import { useLiveBoard } from '@/core/hooks/data/play/useLiveBoard'
import type { LiveBoardShape } from '@/core/hooks/data/play/useLiveBoard'
import { isNewerBoard, toBoardState } from '@/core/lib/play/golf'
import type { GolfBoardState, GolfBoardView } from '@/core/lib/play/golf'

// Golf reading of a board
const GOLF_SHAPE: LiveBoardShape<GolfBoardView, GolfBoardState> = {
  toState: toBoardState,
  isNewer: isNewerBoard,
}

/**
 * Live golf board: server render first, then each move read from the stream
 * @param {string} sessionId - Game
 * @param {GolfBoardView} initial - Board of the page render
 * @return {GolfBoardState} - Newest board
 */

export const useGolfBoard = (sessionId: string, initial: GolfBoardView): GolfBoardState =>
  useLiveBoard(sessionId, initial, GOLF_SHAPE)
