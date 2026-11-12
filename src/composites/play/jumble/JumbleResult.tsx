import type { JumbleFace } from '@/composites/play/jumble/types'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { JUMBLE_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { JUMBLE_BOARD } from '@/declarations/ui/variants'

/**
 * Best score first on a podium under confetti
 * @param {Object} props - Result
 * @param {JumbleFace[]} props.seats - Players
 * @return {JSX.Element}
 */

export const JumbleResult = ({ seats }: { seats: JumbleFace[] }) => {
  const ranked = seats.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      right.score - left.score ||
      right.solved - left.solved
  )

  return (
    <div className={JUMBLE_BOARD.result}>
      <PlayPodium
        hasWinner={(ranked[0]?.score ?? 0) > 0}
        ranked={ranked.map((seat) => ({
          ...seat,
          note: fillPlayMessage(JUMBLE_BOARD_COPY.score, { score: seat.score }),
        }))}
      />
    </div>
  )
}
