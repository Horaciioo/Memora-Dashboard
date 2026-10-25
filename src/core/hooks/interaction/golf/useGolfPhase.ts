'use client'

import { useServerAlarm } from '@/core/hooks/interaction/state/useServerAlarm'
import { golfPhase } from '@/core/lib/play/golf'
import type { GolfBoardState } from '@/core/lib/play/golf'
import type { GolfPhaseName } from '@/utils/constants/play'

/**
 * Stage of the hole, read again at each of its timers
 * @param {GolfBoardState} board - Board
 * @return {GolfPhaseName} - Stage now
 */

export const useGolfPhase = (board: GolfBoardState): GolfPhaseName => {
  const now = useServerAlarm(
    [board.startsAt, board.endsAt, board.closedAt, board.nextAt],
    board.serverTime - board.receivedAt,
    board.receivedAt
  )

  return golfPhase(board, now, board.holes)
}
