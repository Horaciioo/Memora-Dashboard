import { Avatar } from '@/components/elements/display/Avatar'
import { PlayConfetti } from '@/composites/play/baccalaureat/PlayConfetti'
import type { BombFace } from '@/composites/play/bomb/types'
import { BOMB_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_BOARD, BAC_PODIUM_BLOCKS, BOMB_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Places on the podium, the winner in the middle
const PODIUM_ORDER = [2, 1, 3]
const PODIUM_SIZE = PODIUM_ORDER.length
const WINNER = 1

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
  const winner = ranked.find((seat) => !seat.isOut && !seat.hasLeft)
  const CrownIcon = ICONS.playCrown

  return (
    <div className={BOMB_BOARD.result}>
      {winner && <PlayConfetti />}
      <div className={BAC_BOARD.podium}>
        {PODIUM_ORDER.map((place) => {
          const seat = ranked[place - 1]
          if (!seat) return null

          return (
            <div key={place} className={BAC_BOARD.podiumPlace}>
              <div className={BAC_BOARD.podiumFace}>
                {place === WINNER && winner && (
                  <CrownIcon className={BAC_BOARD.podiumCrown} aria-hidden="true" />
                )}
                <Avatar name={seat.name} src={seat.avatarUrl} size="lg" />
              </div>
              <span className={BAC_BOARD.podiumPoints}>
                {fillPlayMessage(BOMB_BOARD_COPY.words, { count: seat.words })}
              </span>
              <div className={cn(BAC_BOARD.podiumBlock, BAC_PODIUM_BLOCKS[place])}>{place}</div>
            </div>
          )
        })}
      </div>
      {ranked.length > PODIUM_SIZE && (
        <ol className={BAC_BOARD.ranks}>
          {ranked.slice(PODIUM_SIZE).map((seat, index) => (
            <li key={seat.accountId} className={BAC_BOARD.rank}>
              <span className={BAC_BOARD.rankIndex}>{index + PODIUM_SIZE + 1}</span>
              <Avatar name={seat.name} src={seat.avatarUrl} size="sm" />
              <span className={BAC_BOARD.rankName}>{seat.name}</span>
              <span className={BAC_BOARD.rankPoints}>
                {fillPlayMessage(BOMB_BOARD_COPY.words, { count: seat.words })}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
