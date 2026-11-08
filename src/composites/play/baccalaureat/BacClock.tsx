import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Ring geometry in a 100 box
const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const STROKE = 8

// Clock turns red under this
const LOW_SECONDS = 10

/**
 * Ring emptying with the seconds left
 * @param {Object} props - Clock
 * @param {number} props.left - Seconds left
 * @param {number} props.total - Seconds of the phase
 * @return {JSX.Element}
 */

export const BacClock = ({ left, total }: { left: number; total: number }) => {
  const isLow = left <= LOW_SECONDS
  const share = total > 0 ? Math.min(1, left / total) : 0

  return (
    <div className={BAC_BOARD.clock} role="timer" aria-live="off">
      <svg className={BAC_BOARD.clockSvg} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle className={BAC_BOARD.clockTrack} cx="50" cy="50" r={RADIUS} strokeWidth={STROKE} />
        <circle
          className={cn(BAC_BOARD.clockBar, isLow && BAC_BOARD.clockBarLow)}
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - share)}
        />
      </svg>
      <span className={cn(BAC_BOARD.clockNumber, isLow && BAC_BOARD.clockLow)}>{left}</span>
    </div>
  )
}
