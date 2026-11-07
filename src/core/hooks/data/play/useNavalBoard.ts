'use client'

import { useLiveBoard } from '@/core/hooks/data/play/useLiveBoard'
import type { LiveBoardShape } from '@/core/hooks/data/play/useLiveBoard'
import { isNewerNaval, toNavalState } from '@/core/lib/play/naval/state'
import type { NavalBoardState, NavalBoardView } from '@/core/lib/play/naval/state'

// Naval reading of a board
const NAVAL_SHAPE: LiveBoardShape<NavalBoardView, NavalBoardState> = {
  toState: toNavalState,
  isNewer: isNewerNaval,
}

/**
 * Live naval board: server render first, then each change pushed
 * @param {string} sessionId - Game
 * @param {NavalBoardView} initial - Board of the page render
 * @return {NavalBoardState} - Newest board
 */

export const useNavalBoard = (sessionId: string, initial: NavalBoardView): NavalBoardState =>
  useLiveBoard(sessionId, initial, NAVAL_SHAPE)
