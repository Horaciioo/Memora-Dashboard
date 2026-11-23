const SIZE = 22
const STROKE = 2.5
const RADIUS = (SIZE - STROKE) / 2
const LENGTH = 2 * Math.PI * RADIUS

export interface DecisionRingProps {
  // Seconds left
  left: number
  // Seconds in all
  total: number
}

/**
 * Ring emptying with the seconds left inside
 * @param {DecisionRingProps} props - Time left and total
 * @return {JSX.Element}
 */

export const DecisionRing = ({ left, total }: DecisionRingProps) => (
  <span
    className="relative inline-flex shrink-0 items-center justify-center align-middle"
    style={{ width: SIZE, height: SIZE }}
    role="timer"
    aria-label={`${left} s`}
  >
    <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90" aria-hidden="true">
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={STROKE}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--color-apple-green)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={LENGTH}
        strokeDashoffset={LENGTH * (1 - Math.max(0, left - 1) / total)}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
    <span className="text-[0.625rem] leading-none font-bold tabular-nums">{left}</span>
  </span>
)
