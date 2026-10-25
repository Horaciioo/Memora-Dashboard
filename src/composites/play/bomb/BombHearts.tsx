import { ICONS } from '@/declarations/ui/icons'
import { BOMB_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Lives left out of the ceiling
 * @param {Object} props - Hearts
 * @param {number} props.lives - Lives left
 * @param {number} props.max - Ceiling
 * @return {JSX.Element}
 */

export const BombHearts = ({ lives, max }: { lives: number; max: number }) => {
  const HeartIcon = ICONS.playHeart

  return (
    <span className={BOMB_BOARD.hearts}>
      {Array.from({ length: Math.max(max, lives) }, (_, index) => (
        <span key={index} className={cn(BOMB_BOARD.heartCell, index < lives && BOMB_BOARD.heartShine)}>
          <HeartIcon
            className={cn(BOMB_BOARD.heart, index < lives ? BOMB_BOARD.heartOn : BOMB_BOARD.heartOff)}
          />
        </span>
      ))}
    </span>
  )
}
