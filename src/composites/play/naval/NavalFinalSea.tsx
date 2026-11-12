'use client'

import { useState } from 'react'

import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { marksToward, shipsShown } from '@/composites/play/naval/battle/battleView'
import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import { shotViewsOf } from '@/core/lib/play/naval/state'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { ICONS } from '@/declarations/ui/icons'
import { NAVAL_RESULT } from '@/declarations/ui/variants/games/naval'

/**
 * Sea of a captain once the battle is over, arrows to the other seas
 * @param {Object} props - Final sea
 * @param {NavalBoardState} props.board - Board
 * @param {number} props.match - Match
 * @param {number} props.seat - Captain first shown
 * @param {NavalCaptainView[]} props.captains - Captains
 * @return {JSX.Element}
 */

export const NavalFinalSea = ({
  board,
  match,
  seat,
  captains,
}: {
  board: NavalBoardState
  match: number
  seat: number
  captains: NavalCaptainView[]
}) => {
  const [shownSeat, setShownSeat] = useState(seat)
  const PreviousIcon = ICONS.playPrevious
  const NextIcon = ICONS.playNext
  const total = captains.length
  const captain = captains[shownSeat]
  // Last match this captain sailed in
  const seatMatch = board.matches.findLastIndex((entry) => entry.fighters.includes(shownSeat))
  const shots = shotViewsOf(board.shots)
  const seaMatch = seatMatch >= 0 ? seatMatch : match
  const marks = marksToward(board, shots, seaMatch, shownSeat)
  const go = (step: number) => setShownSeat((shownSeat + step + total) % total)

  return (
    <>
      {total > 1 && (
        <div className={NAVAL_RESULT.seaNav}>
          <button
            type="button"
            className={NAVAL_RESULT.seaArrow}
            aria-label={NAVAL_BOARD_COPY.previousSea}
            onClick={() => go(-1)}
          >
            <PreviousIcon aria-hidden="true" />
          </button>
          <div className={NAVAL_RESULT.seaTitle}>
            <span className={NAVAL_RESULT.seaName}>
              {fillPlayMessage(NAVAL_BOARD_COPY.seaOf, { name: captain.name })}
            </span>
            <span className={NAVAL_RESULT.seaCount}>
              {fillPlayMessage(NAVAL_BOARD_COPY.seaCount, { index: shownSeat + 1, total })}
            </span>
          </div>
          <button
            type="button"
            className={NAVAL_RESULT.seaArrow}
            aria-label={NAVAL_BOARD_COPY.nextSea}
            onClick={() => go(1)}
          >
            <NextIcon aria-hidden="true" />
          </button>
        </div>
      )}
      <div className={NAVAL_RESULT.sea}>
        <NavalOcean
          key={shownSeat}
          size={board.sea.size}
          map={board.settings.map}
          marks={marks}
          ships={shipsShown(board, marks, seaMatch, shownSeat)}
          label={NAVAL_BOARD_COPY.finalSea}
        />
      </div>
    </>
  )
}
