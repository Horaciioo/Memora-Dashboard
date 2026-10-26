import { fillPlayMessage } from '@/declarations/play/copy'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GolfPhases } from '@/utils/constants/play'
import type { GolfPhaseName } from '@/utils/constants/play'

/**
 * Line under the course for the viewer
 * @param {Object} input - Viewer and hole
 * @param {GolfPlayerState | undefined} input.me - Own ball, none when watching
 * @param {GolfPhaseName} input.phase - Stage
 * @return {string} - Status, empty when there is nothing to say
 */

export const golfStatus = ({
  me,
  phase,
}: {
  me: GolfPlayerState | undefined
  phase: GolfPhaseName
}): string => {
  if (!me) return GOLF_BOARD_COPY.spectating
  if (me.isHoled) {
    return `${fillPlayMessage(GOLF_BOARD_COPY.holedStatus, { count: me.strokes })} ${GOLF_BOARD_COPY.waiting}`
  }

  return me.isDone && phase === GolfPhases.Playing ? GOLF_BOARD_COPY.outOfStrokes : ''
}
