import { JUMBLE_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { JUMBLE_BOARD } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'
import { Avatar } from '@/components/elements/display/Avatar'
import { secondsLabel } from '@/core/lib/play/jumble'
import type { JumbleBoardView, JumbleFace } from '@/composites/play/jumble/types'

/**
 * Who found the word and what it paid, or the timeout
 * @param {Object} props - Banner
 * @param {NonNullable<JumbleBoardView['reveal']>} props.reveal - Round result
 * @param {JumbleFace | undefined} props.solver - Face of the solver
 * @param {boolean} props.isMine - The viewer found it
 * @return {JSX.Element}
 */

export const JumbleReveal = ({
  reveal,
  solver,
  isMine,
}: {
  reveal: NonNullable<JumbleBoardView['reveal']>
  solver: JumbleFace | undefined
  isMine: boolean
}) => {
  const FlameIcon = ICONS.playFlame

  if (!reveal.solverId) {
    return (
      <div className={JUMBLE_BOARD.reveal} aria-live="polite">
        <span className={JUMBLE_BOARD.timeout}>{JUMBLE_BOARD_COPY.timeout}</span>
        <span className={JUMBLE_BOARD.itWas}>
          {JUMBLE_BOARD_COPY.itWas} {reveal.word}
        </span>
      </div>
    )
  }

  return (
    <div className={JUMBLE_BOARD.reveal} aria-live="polite">
      {solver && <Avatar name={solver.name} src={solver.avatarUrl} size="lg" />}
      <span className={JUMBLE_BOARD.revealName}>
        {isMine
          ? JUMBLE_BOARD_COPY.mine
          : fillPlayMessage(JUMBLE_BOARD_COPY.solvedBy, { name: solver?.name ?? '' })}{' '}
        {fillPlayMessage(JUMBLE_BOARD_COPY.solvedIn, { seconds: secondsLabel(reveal.ms) })}
      </span>
      <span className={JUMBLE_BOARD.gain}>
        {fillPlayMessage(JUMBLE_BOARD_COPY.points, { points: reveal.points })}
      </span>
      <div className={JUMBLE_BOARD.ribbons}>
        {reveal.isFlash && (
          <span className={cn(JUMBLE_BOARD.ribbon, JUMBLE_BOARD.ribbonFlash)}>
            {JUMBLE_BOARD_COPY.flash}
          </span>
        )}
        {reveal.streak > 1 && (
          <span className={JUMBLE_BOARD.ribbon}>
            <FlameIcon className="mr-1 inline size-3.5 align-text-bottom" aria-hidden="true" />
            {fillPlayMessage(JUMBLE_BOARD_COPY.streak, { count: reveal.streak })}
          </span>
        )}
      </div>
    </div>
  )
}
