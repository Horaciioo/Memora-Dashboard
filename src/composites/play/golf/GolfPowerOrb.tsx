import type { CSSProperties } from 'react'

import { powerPaint } from '@/composites/play/golf/types'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD, GOLF_ORB } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Orb of a power: its glyph on a cube tinted by the power
 * @param {Object} props - Orb
 * @param {GolfPowerName} props.power - Power
 * @param {boolean} [props.hasKind] - Bonus or malus badge
 * @param {string} [props.className] - Size
 * @return {JSX.Element}
 */

export const GolfPowerOrb = ({
  power,
  hasKind = false,
  className,
}: {
  power: GolfPowerName
  hasKind?: boolean
  className?: string
}) => {
  const { icon, isBonus } = GOLF_POWERS.get(power)
  const Icon = ICONS[icon]
  const KindIcon = ICONS[isBonus ? 'add' : 'close']

  return (
    <span
      className={cn(GOLF_ORB.root, className)}
      style={{ '--power': powerPaint(power) } as CSSProperties}
      aria-hidden="true"
    >
      <span className={GOLF_ORB.cube} data-power={power} />
      <Icon className={GOLF_ORB.glyph} />
      {hasKind && (
        <span className={cn(GOLF_ORB.kind, isBonus ? GOLF_BOARD.bonus : GOLF_BOARD.malus)}>
          <KindIcon className={GOLF_ORB.kindIcon} />
        </span>
      )}
    </span>
  )
}

/**
 * Grey cube of a case holding nothing
 * @param {Object} props - Cube
 * @param {string} [props.className] - Size
 * @return {JSX.Element}
 */

export const GolfEmptyOrb = ({ className }: { className?: string }) => (
  <span
    className={cn(GOLF_ORB.root, className)}
    style={{ '--power': 'var(--play-golf-empty)' } as CSSProperties}
    aria-hidden="true"
  >
    <span className={GOLF_ORB.cube} />
  </span>
)
