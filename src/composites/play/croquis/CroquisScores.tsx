import { Avatar } from '@/components/elements/display/Avatar'
import type { CroquisFace } from '@/composites/play/croquis/types'
import { CROQUIS_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Players by score, the drawer and those who found the word marked
 * @param {Object} props - Scoreboard
 * @param {CroquisFace[]} props.seats - Players
 * @param {boolean} props.isRunning - A word is being drawn
 * @return {JSX.Element}
 */

export const CroquisScores = ({
  seats,
  isRunning,
}: {
  seats: CroquisFace[]
  isRunning: boolean
}) => {
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.found - left.found
  )

  return (
    <ol className={CROQUIS_BOARD.scores} aria-label={CROQUIS_BOARD_COPY.ranking}>
      {ranked.map((seat, index) => {
        const state = seat.isDrawer
          ? CROQUIS_BOARD_COPY.drawer
          : seat.rank !== null
            ? CROQUIS_BOARD_COPY.done
            : null

        return (
          <li
            // Rank in the key replays the highlight when a player finds the word
            key={`${seat.accountId}-${seat.rank ?? 0}`}
            className={cn(
              CROQUIS_BOARD.score,
              seat.rank !== null && CROQUIS_BOARD.scoreScored,
              seat.hasLeft && CROQUIS_BOARD.scoreLeft
            )}
          >
            <span className={CROQUIS_BOARD.scoreRank}>{index + 1}</span>
            <Avatar name={seat.name} src={seat.avatarUrl} size="sm" />
            <span className={CROQUIS_BOARD.scoreName}>{seat.name}</span>
            {isRunning && state && <span className={CROQUIS_BOARD.scoreState}>{state}</span>}
            <span className={CROQUIS_BOARD.scoreValue}>
              {fillPlayMessage(CROQUIS_BOARD_COPY.score, { score: seat.score })}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
