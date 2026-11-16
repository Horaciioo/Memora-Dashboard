import { skinOf } from '@/core/lib/play/skins'
import { LEVEL_SKIN_COPY } from '@/declarations/play/skins'
import { LEVEL_BADGE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface LevelBadgeProps {
  level: number
  className?: string
}

/**
 * Level chip painted in the skin of its level
 * @param {LevelBadgeProps} props - Level
 * @return {JSX.Element}
 */

export const LevelBadge = ({ level, className }: LevelBadgeProps) => {
  const skin = skinOf(level)

  return (
    <span
      data-skin={skin.key}
      title={LEVEL_SKIN_COPY.title.replace('{level}', String(level)).replace('{skin}', skin.label)}
      className={cn('skin-badge', LEVEL_BADGE.root, className)}
    >
      {LEVEL_SKIN_COPY.badge.replace('{level}', String(level))}
    </span>
  )
}
