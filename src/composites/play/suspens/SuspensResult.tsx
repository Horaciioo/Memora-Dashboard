import type { SuspensFace } from '@/composites/play/suspens/types'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { fillPlayMessage, SUSPENS_BOARD_COPY } from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'

/**
 * Best score first on a podium under confetti
 * @param {Object} props - Result
 * @param {SuspensFace[]} props.seats - Players
 * @return {JSX.Element}
 */

export const SuspensResult = ({ seats }: { seats: SuspensFace[] }) => {
  const ranked = seats.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      right.score - left.score ||
      right.found - left.found
  )

  return (
    <div className={SUSPENS_BOARD.result}>
      <PlayPodium
        hasWinner={(ranked[0]?.score ?? 0) > 0}
        ranked={ranked.map((seat) => ({
          ...seat,
          note: fillPlayMessage(SUSPENS_BOARD_COPY.score, { score: seat.score }),
        }))}
      />
    </div>
  )
}
