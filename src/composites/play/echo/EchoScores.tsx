import { Avatar } from '@/components/elements/display/Avatar'
import type { EchoFace } from '@/composites/play/echo/types'
import { ECHO_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ECHO_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Players by score, a tick on those who found this round
 * @param {Object} props - Scoreboard
 * @param {EchoFace[]} props.seats - Players
 * @param {number} props.round - Round, restarts the highlight
 * @return {JSX.Element}
 */

export const EchoScores = ({ seats, round }: { seats: EchoFace[]; round: number }) => {
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.found - left.found
  )

  return (
    <ol className={ECHO_BOARD.scores} aria-label={ECHO_BOARD_COPY.ranking}>
      {ranked.map((seat, index) => (
        <li
          // Round in the key replays the highlight
          key={`${seat.accountId}-${seat.rank ? round : 0}`}
          className={cn(
            ECHO_BOARD.score,
            seat.rank !== null && ECHO_BOARD.scoreScored,
            seat.hasLeft && ECHO_BOARD.scoreLeft
          )}
        >
          <span className={ECHO_BOARD.scoreRank}>{index + 1}</span>
          <Avatar name={seat.name} src={seat.avatarUrl} size="sm" />
          <span className={ECHO_BOARD.scoreName}>{seat.name}</span>
          {seat.rank !== null && (
            <span className={ECHO_BOARD.scoreGain}>
              {fillPlayMessage(ECHO_BOARD_COPY.points, { points: seat.gain })}
            </span>
          )}
          <span className={ECHO_BOARD.scoreValue}>
            {fillPlayMessage(ECHO_BOARD_COPY.score, { score: seat.score })}
          </span>
        </li>
      ))}
    </ol>
  )
}
