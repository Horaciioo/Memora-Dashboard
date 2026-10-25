import { PlayPodium } from '@/composites/play/results/PlayPodium'
import type { BombFace } from '@/composites/play/bomb/types'
import { BOMB_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BOMB_BOARD } from '@/declarations/ui/variants'

/**
 * Survivors first, then the latest out
 * @param {BombFace[]} seats - Table
 * @return {BombFace[]} - Ranking
 */

const rankSeats = (seats: BombFace[]): BombFace[] =>
  seats.toSorted(
    (left, right) =>
      Number(left.hasLeft) - Number(right.hasLeft) ||
      Number(left.isOut) - Number(right.isOut) ||
      new Date(right.eliminatedAt ?? 0).getTime() - new Date(left.eliminatedAt ?? 0).getTime()
  )

/**
 * Last one standing on a podium under confetti, the others listed below
 * @param {Object} props - Result
 * @param {BombFace[]} props.seats - Table
 * @return {JSX.Element}
 */

export const BombResult = ({ seats }: { seats: BombFace[] }) => {
  const ranked = rankSeats(seats)

  return (
    <div className={BOMB_BOARD.result}>
      <PlayPodium
        hasWinner={ranked.some((seat) => !seat.isOut && !seat.hasLeft)}
        ranked={ranked.map((seat) => ({
          ...seat,
          note: fillPlayMessage(BOMB_BOARD_COPY.words, { count: seat.words }),
        }))}
      />
    </div>
  )
}
