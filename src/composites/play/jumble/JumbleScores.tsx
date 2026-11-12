import { Avatar } from '@/components/elements/display/Avatar'
import type { JumbleFace } from '@/composites/play/jumble/types'
import { JUMBLE_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { JUMBLE_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Players by score, the one who just scored lighting up
 * @param {Object} props - Scoreboard
 * @param {JumbleFace[]} props.seats - Players
 * @param {string | null} props.scoredId - Latest solver
 * @param {number} props.round - Round, restarts the highlight
 * @return {JSX.Element}
 */

export const JumbleScores = ({
  seats,
  scoredId,
  round,
}: {
  seats: JumbleFace[]
  scoredId: string | null
  round: number
}) => {
  const FlameIcon = ICONS.playFlame
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.solved - left.solved
  )

  return (
    <ol className={JUMBLE_BOARD.scores} aria-label={JUMBLE_BOARD_COPY.ranking}>
      {ranked.map((seat, index) => (
        <li
          // Round in the key replays the highlight
          key={`${seat.accountId}-${seat.accountId === scoredId ? round : 0}`}
          className={cn(
            JUMBLE_BOARD.score,
            seat.accountId === scoredId && JUMBLE_BOARD.scoreScored,
            seat.hasLeft && JUMBLE_BOARD.scoreLeft
          )}
        >
          <span className={JUMBLE_BOARD.scoreRank}>{index + 1}</span>
          <Avatar name={seat.name} src={seat.avatarUrl} size="sm" />
          <span className={JUMBLE_BOARD.scoreName}>{seat.name}</span>
          {seat.streak > 1 && (
            <span className={JUMBLE_BOARD.scoreStreak}>
              <FlameIcon className="mr-0.5 inline size-3.5 align-text-bottom" aria-hidden="true" />
              {seat.streak}
            </span>
          )}
          <span className={JUMBLE_BOARD.scoreValue}>
            {fillPlayMessage(JUMBLE_BOARD_COPY.score, { score: seat.score })}
          </span>
        </li>
      ))}
    </ol>
  )
}
