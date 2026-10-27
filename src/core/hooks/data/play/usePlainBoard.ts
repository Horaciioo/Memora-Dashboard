'use client'

import { isLaterBoard, useLiveBoard } from '@/core/hooks/data/play/useLiveBoard'
import type { LiveBoardShape } from '@/core/hooks/data/play/useLiveBoard'

// Board drawn as read, ordered by its clock
const PLAIN_SHAPE = { toState: (view: unknown) => view, isNewer: isLaterBoard }

/**
 * Live board of a game drawn straight from its view
 * @param {string} sessionId - Game
 * @param {View} initial - Board of the page render
 * @return {View} - Newest board
 */

export const usePlainBoard = <View extends { serverTime: Date | string }>(
  sessionId: string,
  initial: View
): View => useLiveBoard(sessionId, initial, PLAIN_SHAPE as unknown as LiveBoardShape<View, View>)
