import { useState } from 'react'

import { BOMB_BOARD_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PLAY_HEARTS } from '@/declarations/ui/variants'
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
 * Lives left out of the ceiling, a won heart pops, a lost one empties, a full row turns gold
 * @param {Object} props - Hearts
 * @param {number} props.lives - Lives left
 * @param {number} props.max - Ceiling
 * @param {IconName} [props.icon] - Glyph of one life
 * @param {boolean} [props.isSmall] - Small row, no win tag
 * @return {JSX.Element}
 */

export const PlayHearts = ({
  lives,
  max,
  icon = 'playHeart',
  isSmall = false,
}: {
  lives: number
  max: number
  icon?: IconName
  isSmall?: boolean
}) => {
  const HeartIcon = ICONS[icon]
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
    <span
      className={cn(
        PLAY_HEARTS.hearts,
        move.isCapped && PLAY_HEARTS.heartsMax,
        isSmall && PLAY_HEARTS.heartsSmall
      )}
    >
      {Array.from({ length: Math.max(max, lives) }, (_, index) => (
        <span
          key={index}
          className={cn(
            PLAY_HEARTS.heartCell,
            index < lives && PLAY_HEARTS.heartShine,
            index === move.gained && PLAY_HEARTS.heartGain,
            index === move.lost && PLAY_HEARTS.heartLose
          )}
        >
          <HeartIcon
            className={cn(
              isSmall ? PLAY_HEARTS.heartSmall : PLAY_HEARTS.heart,
              index < lives ? PLAY_HEARTS.heartOn : PLAY_HEARTS.heartOff
            )}
          />
          {index === move.gained && <span className={PLAY_HEARTS.heartBurst} aria-hidden="true" />}
        </span>
      ))}
      {move.gained >= 0 && !isSmall && (
        // Keyed so a second win replays it
        <span key={move.lives} className={PLAY_HEARTS.heartTag} aria-live="polite">
          {move.isCapped ? BOMB_BOARD_COPY.lifeMax : BOMB_BOARD_COPY.lifeGained}
        </span>
      )}
    </span>
  )
}
