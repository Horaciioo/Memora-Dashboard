import { Avatar } from '@/components/elements/display/Avatar'
import type { SuspensBoardView, SuspensFace } from '@/composites/play/suspens/types'
import { fillPlayMessage, SUSPENS_BOARD_COPY } from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'

/**
 * How the round ended, the word and what it paid the setter
 * @param {Object} props - Banner
 * @param {NonNullable<SuspensBoardView['reveal']>} props.reveal - Round result
 * @param {SuspensFace[]} props.seats - Players
 * @return {JSX.Element}
 */

export const SuspensReveal = ({
  reveal,
  seats,
}: {
  reveal: NonNullable<SuspensBoardView['reveal']>
  seats: SuspensFace[]
}) => {
  const solver = seats.find((seat) => seat.accountId === reveal.solverId)
  const setter = seats.find((seat) => seat.accountId === reveal.setterId)
  const winner = reveal.isSolved ? solver : setter

  return (
    <div className={SUSPENS_BOARD.reveal} aria-live="polite">
      {winner && <Avatar name={winner.name} src={winner.avatarUrl} size="lg" />}
      <span className={SUSPENS_BOARD.revealName}>
        {reveal.isSolved
          ? fillPlayMessage(SUSPENS_BOARD_COPY.solved, { name: solver?.name ?? '' })
          : SUSPENS_BOARD_COPY.hanged}
      </span>
      {setter && reveal.setterPoints > 0 && (
        <span className={SUSPENS_BOARD.itWas}>
          {fillPlayMessage(SUSPENS_BOARD_COPY.setterGain, {
            name: setter.name,
            points: reveal.setterPoints,
          })}
        </span>
      )}
      <span className={SUSPENS_BOARD.itWas}>{SUSPENS_BOARD_COPY.itWas}</span>
      <span className={SUSPENS_BOARD.revealWord}>{reveal.word}</span>
    </div>
  )
}
