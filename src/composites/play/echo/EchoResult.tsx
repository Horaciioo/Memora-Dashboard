import type { EchoFace } from '@/composites/play/echo/types'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { ECHO_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ECHO_BOARD } from '@/declarations/ui/variants'

/**
 * Best score first on a podium under confetti
 * @param {Object} props - Result
 * @param {EchoFace[]} props.seats - Players
 * @return {JSX.Element}
 */

export const EchoResult = ({ seats }: { seats: EchoFace[] }) => {
  const ranked = seats.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      right.score - left.score ||
      right.found - left.found
  )

  return (
    <div className={ECHO_BOARD.result}>
      <PlayPodium
        hasWinner={(ranked[0]?.score ?? 0) > 0}
        ranked={ranked.map((seat) => ({
          ...seat,
          note: fillPlayMessage(ECHO_BOARD_COPY.score, { score: seat.score }),
        }))}
      />
    </div>
  )
}
