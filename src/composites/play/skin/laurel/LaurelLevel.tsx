import { LAUREL } from '@/declarations/play/laurel'

// Digits shrink from three on
const WIDE_DIGITS = 3

export interface LaurelLevelProps {
  level: number
}

/**
 * Level bubble under the portrait
 * @param {LaurelLevelProps} props - Player level
 * @return {JSX.Element}
 */

export const LaurelLevel = ({ level }: LaurelLevelProps) => {
  const { centre, badge } = LAUREL

  return (
    <>
      <circle
        cx={centre}
        cy={badge.y}
        r={badge.radius}
        strokeWidth={badge.ring}
        className="laurel-badge"
      />
      <text
        x={centre}
        y={badge.y + 0.6}
        textAnchor="middle"
        dominantBaseline="central"
        className={
          String(level).length >= WIDE_DIGITS ? 'laurel-level laurel-level-wide' : 'laurel-level'
        }
      >
        {level}
      </text>
    </>
  )
}
