import { rankPlayers } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'

/**
 * Totals of the scored rounds, best first
 * @param {Object} props - Board and players
 * @param {BacBoardView['history']} props.history - Rounds
 * @param {BacPlayer[]} props.players - Table
 * @param {number} [props.skip] - Places already shown elsewhere
 * @return {JSX.Element}
 */

export const BacRanking = ({
  history,
  players,
  skip = 0,
}: {
  history: BacBoardView['history']
  players: BacPlayer[]
  skip?: number
}) => (
  <ol className={BAC_BOARD.ranks}>
    {rankPlayers(history, players)
      .slice(skip)
      .map((player, index) => (
        <li key={player.accountId} className={BAC_BOARD.rank}>
          <span className={BAC_BOARD.rankIndex}>{skip + index + 1}</span>
          <span className={BAC_BOARD.rankName}>{player.name}</span>
          <span className={BAC_BOARD.rankPoints}>
            {fillPlayMessage(BAC_BOARD_COPY.points, { points: player.points })}
          </span>
        </li>
      ))}
  </ol>
)
