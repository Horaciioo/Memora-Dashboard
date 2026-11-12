import type { CroquisFace } from '@/composites/play/croquis/types'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { CROQUIS_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'

/**
 * Best score first on a podium under confetti
 * @param {Object} props - Result
 * @param {CroquisFace[]} props.seats - Players
 * @return {JSX.Element}
 */

export const CroquisResult = ({ seats }: { seats: CroquisFace[] }) => {
  const ranked = seats.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      right.score - left.score ||
      right.found - left.found
  )

  return (
    <div className={CROQUIS_BOARD.result}>
      <PlayPodium
        hasWinner={(ranked[0]?.score ?? 0) > 0}
        ranked={ranked.map((seat) => ({
          ...seat,
          note: fillPlayMessage(CROQUIS_BOARD_COPY.score, { score: seat.score }),
        }))}
      />
    </div>
  )
}
