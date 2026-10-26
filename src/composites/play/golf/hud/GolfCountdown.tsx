'use client'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_BOARD } from '@/declarations/ui/variants'

/**
 * Before a hole: the big count for the first, a title card for the next ones
 * @param {Object} props - Hole
 * @param {number} props.hole - Hole index
 * @param {string} props.course - Course name
 * @param {number} props.startsAt - Server ms the hole opens
 * @param {number} props.serverTime - Server ms of the board
 * @return {JSX.Element | null}
 */

export const GolfCountdown = ({
  hole,
  course,
  startsAt,
  serverTime,
}: {
  hole: number
  course: string
  startsAt: number
  serverTime: number
}) => {
  const now = useServerNow(new Date(serverTime))
  const seconds = secondsTo(new Date(startsAt), now)
  if (seconds <= 0) return null
  const title = fillPlayMessage(GOLF_BOARD_COPY.hole, { index: hole + 1 })

  if (hole === 0) {
    return (
      <PlayCountdown
        seconds={seconds}
        lead={`${course} - ${title}`}
        figureClassName={GOLF_BOARD.figureCountdown}
      />
    )
  }

  return (
    <div className={GOLF_BOARD.intro} aria-live="polite">
      <div className={GOLF_BOARD.introCard}>
        <span className={GOLF_BOARD.introCourse}>{course}</span>
        <span className={GOLF_BOARD.introHole}>{title}</span>
      </div>
    </div>
  )
}
