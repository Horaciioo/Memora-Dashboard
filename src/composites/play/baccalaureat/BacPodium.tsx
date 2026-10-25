import { rankPlayers } from '@/composites/play/baccalaureat/types'
import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'

/**
 * Final ranking as a podium under confetti, the other places listed below
 * @param {Object} props - Board and players
 * @param {BacBoardView['history']} props.history - Rounds
 * @param {BacPlayer[]} props.players - Table
 * @return {JSX.Element}
 */

export const BacPodium = ({
  history,
  players,
}: {
  history: BacBoardView['history']
  players: BacPlayer[]
}) => (
  <div className={BAC_BOARD.board}>
    <PlayPodium
      hasWinner
      ranked={rankPlayers(history, players).map((player) => ({
        ...player,
        note: fillPlayMessage(BAC_BOARD_COPY.points, { points: player.points }),
      }))}
    />
  </div>
)
