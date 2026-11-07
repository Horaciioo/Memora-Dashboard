import { useState } from 'react'

import { BOMB_BOARD_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BOMB_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// What the last change did to the row
interface HeartsMove {
  lives: number
  // Heart index just won or lost
  gained: number
  lost: number
  // Ceiling reached by a win
  isCapped: boolean
}

/**
 * Lives left out of the ceiling, a won heart pops and a full row turns gold
 * @param {Object} props - Hearts
 * @param {number} props.lives - Lives left
 * @param {number} props.max - Ceiling
 * @return {JSX.Element}
 */

export const BombHearts = ({ lives, max }: { lives: number; max: number }) => {
  const HeartIcon = ICONS.playHeart
  const [move, setMove] = useState<HeartsMove>({ lives, gained: -1, lost: -1, isCapped: false })

  // Read the change as it renders
  if (move.lives !== lives) {
    const isWin = lives > move.lives
    setMove({
      lives,
      gained: isWin ? lives - 1 : -1,
      lost: isWin ? -1 : lives,
      isCapped: isWin ? lives >= max : false,
    })
  }

  return (
    <span className={cn(BOMB_BOARD.hearts, move.isCapped && BOMB_BOARD.heartsMax)}>
      {Array.from({ length: Math.max(max, lives) }, (_, index) => (
        <span
          key={index}
          className={cn(
            BOMB_BOARD.heartCell,
            index < lives && BOMB_BOARD.heartShine,
            index === move.gained && BOMB_BOARD.heartGain,
            index === move.lost && BOMB_BOARD.heartLose
          )}
        >
          <HeartIcon
            className={cn(
              BOMB_BOARD.heart,
              index < lives ? BOMB_BOARD.heartOn : BOMB_BOARD.heartOff
            )}
          />
          {index === move.gained && <span className={BOMB_BOARD.heartBurst} aria-hidden="true" />}
        </span>
      ))}
      {move.gained >= 0 && (
        // Keyed so a second win replays it
        <span key={move.lives} className={BOMB_BOARD.heartTag} aria-live="polite">
          {move.isCapped ? BOMB_BOARD_COPY.lifeMax : BOMB_BOARD_COPY.lifeGained}
        </span>
      )}
    </span>
  )
}
