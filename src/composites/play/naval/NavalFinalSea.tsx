'use client'

import { marksToward, shipsShown } from '@/composites/play/naval/battle/battleView'
import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import { shotViewsOf } from '@/core/lib/play/naval/state'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_RESULT } from '@/declarations/ui/variants/games/naval'

/**
 * Sea of a captain once the battle is over
 * @param {Object} props - Final sea
 * @param {NavalBoardState} props.board - Board
 * @param {number} props.match - Match
 * @param {number} props.seat - Captain
 * @return {JSX.Element}
 */

export const NavalFinalSea = ({
  board,
  match,
  seat,
}: {
  board: NavalBoardState
  match: number
  seat: number
}) => {
  const marks = marksToward(board, shotViewsOf(board.shots), match, seat)

  return (
    <div className={NAVAL_RESULT.sea}>
      <NavalOcean
        size={board.sea.size}
        map={board.settings.map}
        marks={marks}
        ships={shipsShown(board, marks, match, seat)}
        label={NAVAL_BOARD_COPY.finalSea}
      />
    </div>
  )
}
