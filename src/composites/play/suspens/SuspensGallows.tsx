import { partsShown } from '@/core/lib/play/suspens'
import {
  fillPlayMessage,
  SUSPENS_BOARD_COPY,
  SUSPENS_EYES,
  SUSPENS_GRID,
  SUSPENS_PARTS,
} from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Class of each colour family
const TONES = {
  wood: SUSPENS_BOARD.partWood,
  rope: SUSPENS_BOARD.partRope,
  body: SUSPENS_BOARD.partBody,
} as const

/**
 * Gallows and figure, one part more for each error; the gallows stands ready when few errors are allowed
 * @param {Object} props - Drawing
 * @param {number} props.errors - Errors made
 * @param {number} props.allowed - Errors before the hanging
 * @return {JSX.Element}
 */

export const SuspensGallows = ({ errors, allowed }: { errors: number; allowed: number }) => {
  const shown = partsShown(errors, allowed)
  const isHanged = errors >= allowed
  const parts = SUSPENS_PARTS.slice(0, shown)
  const standing = parts.filter((part) => part.tone === 'wood')
  const hanging = parts.filter((part) => part.tone !== 'wood')

  // Only the part just added draws itself
  const last = parts.at(-1)?.key
  const part = ({ key, d, tone }: (typeof SUSPENS_PARTS)[number]) => (
    <path
      key={key}
      d={d}
      pathLength={1}
      className={cn(TONES[tone], errors > 0 && key === last && SUSPENS_BOARD.partIn)}
    />
  )

  return (
    <svg
      viewBox={`0 0 ${SUSPENS_GRID.width} ${SUSPENS_GRID.height}`}
      className={SUSPENS_BOARD.gallows}
      role="img"
      aria-label={fillPlayMessage(SUSPENS_BOARD_COPY.gallows, { count: errors, max: allowed })}
    >
      {standing.map(part)}
      <g className={cn(isHanged && 'play-suspens-swing')}>
        {hanging.map(part)}
        {isHanged && <path d={SUSPENS_EYES} className={SUSPENS_BOARD.eyes} />}
      </g>
    </svg>
  )
}
