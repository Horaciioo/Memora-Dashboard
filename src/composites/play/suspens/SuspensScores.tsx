import { Avatar } from '@/components/elements/display/Avatar'
import type { SuspensFace } from '@/composites/play/suspens/types'
import { fillPlayMessage, SUSPENS_BOARD_COPY } from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Players by score, the setter and the guesser on turn marked
 * @param {Object} props - Scoreboard
 * @param {SuspensFace[]} props.seats - Players
 * @param {string | null} props.setterId - Setter of the round
 * @param {string | null} props.turnId - Guesser on turn
 * @param {boolean} props.isRunning - A round is being played
 * @return {JSX.Element}
 */

export const SuspensScores = ({
  seats,
  setterId,
  turnId,
  isRunning,
}: {
  seats: SuspensFace[]
  setterId: string | null
  turnId: string | null
  isRunning: boolean
}) => {
  const ranked = seats.toSorted(
    (left, right) => right.score - left.score || right.found - left.found
  )

  return (
    <ol className={SUSPENS_BOARD.scores} aria-label={SUSPENS_BOARD_COPY.ranking}>
      {ranked.map((seat, index) => {
        const state =
          seat.accountId === setterId
            ? SUSPENS_BOARD_COPY.setter
            : seat.accountId === turnId
              ? SUSPENS_BOARD_COPY.onTurn
              : null

        return (
          <li
            key={seat.accountId}
            className={cn(
              SUSPENS_BOARD.score,
              isRunning && seat.accountId === turnId && SUSPENS_BOARD.scoreOn,
              seat.hasLeft && SUSPENS_BOARD.scoreLeft
            )}
          >
            <span className={SUSPENS_BOARD.scoreRank}>{index + 1}</span>
            <Avatar name={seat.name} src={seat.avatarUrl} size="sm" />
            <span className={SUSPENS_BOARD.scoreName}>{seat.name}</span>
            {isRunning && state && <span className={SUSPENS_BOARD.scoreState}>{state}</span>}
            <span className={SUSPENS_BOARD.scoreValue}>
              {fillPlayMessage(SUSPENS_BOARD_COPY.score, { score: seat.score })}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
