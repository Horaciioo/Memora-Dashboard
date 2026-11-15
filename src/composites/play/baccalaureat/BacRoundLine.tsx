import type { BacBoardView, BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'

/**
 * Winner line of a counted round
 * @param {Object} props - Round
 * @param {BacBoardView['history']} props.history - Scored rounds
 * @param {BacPlayer[]} props.players - Table
 * @param {number} props.roundIndex - Round just counted
 * @return {JSX.Element}
 */

export const BacRoundLine = ({
  history,
  players,
  roundIndex,
}: {
  history: BacBoardView['history']
  players: BacPlayer[]
  roundIndex: number
}) => {
  const gains = history.find((entry) => entry.index === roundIndex)?.points ?? {}
  const best = Math.max(0, ...Object.values(gains))
  const winners = best > 0 ? players.filter((player) => gains[player.accountId] === best) : []

  return (
    <span className={BAC_BOARD.roundLine}>
      {winners.length > 0 ? (
        <>
          {fillPlayMessage(BAC_BOARD_COPY.roundWinner, {
            names: winners.map((player) => player.name).join(' et '),
          })}
          <span className={BAC_BOARD.heroPoints}>
            {fillPlayMessage(BAC_BOARD_COPY.roundPoints, { points: best })}
          </span>
        </>
      ) : (
        BAC_BOARD_COPY.roundNoWinner
      )}
    </span>
  )
}
