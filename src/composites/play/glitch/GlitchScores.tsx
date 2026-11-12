import { Avatar } from '@/components/elements/display/Avatar'
import type { GlitchFace } from '@/composites/play/glitch/types'
import { GLITCH_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { GLITCH_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Players by score, with how far each got on this round
 * @param {Object} props - Scoreboard
 * @param {GlitchFace[]} props.seats - Players
 * @param {number} props.total - Differences of the round
 * @param {number} props.round - Round, restarts the highlight
 * @return {JSX.Element}
 */

export const GlitchScores = ({
  seats,
  total,
  round,
}: {
  seats: GlitchFace[]
  total: number
  round: number
}) => {
  const ranked = seats.toSorted((left, right) => right.score - left.score)

  return (
    <ol className={GLITCH_BOARD.scores} aria-label={GLITCH_BOARD_COPY.ranking}>
      {ranked.map((seat, index) => (
        <li
          // Round in the key replays the highlight
          key={`${seat.accountId}-${seat.rank ? round : 0}`}
          className={cn(
            GLITCH_BOARD.score,
            seat.rank !== null && GLITCH_BOARD.scoreScored,
            seat.hasLeft && GLITCH_BOARD.scoreLeft
          )}
        >
          <span className={GLITCH_BOARD.scoreRank}>{index + 1}</span>
          <Avatar name={seat.name} src={seat.avatarUrl} size="sm" />
          <span className={GLITCH_BOARD.scoreName}>{seat.name}</span>
          {seat.rank !== null ? (
            <span className={GLITCH_BOARD.scoreDone}>
              {fillPlayMessage(GLITCH_BOARD_COPY.points, { points: seat.gain })}
            </span>
          ) : (
            <span className={GLITCH_BOARD.scoreFound}>
              {fillPlayMessage(GLITCH_BOARD_COPY.progress, { found: seat.found, total })}
            </span>
          )}
          <span className={GLITCH_BOARD.scoreValue}>
            {fillPlayMessage(GLITCH_BOARD_COPY.score, { score: seat.score })}
          </span>
        </li>
      ))}
    </ol>
  )
}
