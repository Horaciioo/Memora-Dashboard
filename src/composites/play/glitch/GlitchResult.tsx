import type { GlitchFace } from '@/composites/play/glitch/types'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { GLITCH_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { GLITCH_BOARD } from '@/declarations/ui/variants'

/**
 * Best score first on a podium under confetti
 * @param {Object} props - Result
 * @param {GlitchFace[]} props.seats - Players
 * @return {JSX.Element}
 */

export const GlitchResult = ({ seats }: { seats: GlitchFace[] }) => {
  const ranked = seats.toSorted(
    (left, right) => Number(left.hasLeft) - Number(right.hasLeft) || right.score - left.score
  )

  return (
    <div className={GLITCH_BOARD.result}>
      <PlayPodium
        hasWinner={(ranked[0]?.score ?? 0) > 0}
        ranked={ranked.map((seat) => ({
          ...seat,
          note: fillPlayMessage(GLITCH_BOARD_COPY.score, { score: seat.score }),
        }))}
      />
    </div>
  )
}
