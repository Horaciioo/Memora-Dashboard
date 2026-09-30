import { cn } from '@/utils/classnames'

export interface ProgressRingProps {
  value: number
  max: number
  className?: string
  // Colour of the arc, any CSS colour
  colour?: string
}

// Geometry of the ring on its own 100 unit canvas
const RADIUS = 42
const STROKE = 9
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Circular completion mark, its arc drawn from the top and easing to its length
 * @param {number} value - Done
 * @param {number} max - Total
 * @param {string} [className] - Size and placement
 * @param {string} [colour] - Arc colour
 * @return {JSX.Element}
 */

export const ProgressRing = ({ value, max, className, colour }: ProgressRingProps) => {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('-rotate-90', className)}
      role="img"
      aria-label={`${Math.round(ratio * 100)} %`}
    >
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        className="stroke-[var(--color-border)]"
      />
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
        style={{
          stroke: colour ?? 'var(--color-brand-600)',
          transition: 'stroke-dashoffset var(--motion-duration-panel) var(--motion-ease-out)',
        }}
      />
    </svg>
  )
}
