import { useId } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { LaurelDefs } from '@/composites/play/skin/laurel/LaurelDefs'
import { LaurelAura, LaurelFx } from '@/composites/play/skin/laurel/LaurelFx'
import { LaurelLevel } from '@/composites/play/skin/laurel/LaurelLevel'
import { LaurelSweep } from '@/composites/play/skin/laurel/LaurelSweep'
import { LaurelWreath } from '@/composites/play/skin/laurel/LaurelWreath'
import { laurelStageOf, swayOf } from '@/core/lib/play/laurel'
import { skinOf } from '@/core/lib/play/skins'
import { LAUREL } from '@/declarations/play/laurel'
import type { AvatarSize } from '@/declarations/ui/variants/surfaces'
import { LEVEL_FRAME_VIEW } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Portrait pixels by size, the wreath grows around them
const FACE_PX: Partial<Record<AvatarSize, number>> = { xs: 24, sm: 32, md: 40, lg: 64, xl: 96 }

// Sizes wearing veins, light and level
const RICH_SIZES: AvatarSize[] = ['lg', 'xl']

export interface LevelFrameProps {
  level: number
  name: string
  src: string | null
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  // Keeps the footprint of the plain portrait, the wreath spills around it
  bleed?: boolean
}

/**
 * Portrait inside a laurel that grows with the level
 * @param {LevelFrameProps} props - Portrait and level
 * @return {JSX.Element}
 */

export const LevelFrame = ({ level, name, src, size, className, bleed }: LevelFrameProps) => {
  const id = `l${useId().replace(/:/g, '')}`
  const stage = laurelStageOf(level)
  const rich = RICH_SIZES.includes(size)
  const face = FACE_PX[size] ?? FACE_PX.lg ?? 0
  const box = Math.round((face * LAUREL.view) / (2 * LAUREL.face))

  return (
    <span
      data-skin={skinOf(level).key}
      className={cn(LEVEL_FRAME_VIEW.root, className)}
      style={bleed ? { width: face, height: face } : { width: box, height: box }}
    >
      <Avatar name={name} src={src} size={size} className={LEVEL_FRAME_VIEW.face} />
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${LAUREL.view} ${LAUREL.view}`}
        className={LEVEL_FRAME_VIEW.art}
        style={{ width: box, height: box }}
      >
        <LaurelDefs id={id} />
        {rich && <LaurelAura stage={stage} id={id} />}
        <g className="laurel-wreath" data-sway={rich ? swayOf(stage) : 0}>
          <LaurelWreath stage={stage} id={id} rich={rich} />
        </g>
        {rich && stage >= LAUREL.from.sweep && <LaurelSweep stage={stage} id={id} />}
        <circle cx={LAUREL.centre} cy={LAUREL.centre} r={LAUREL.face} className="laurel-ring" />
        {rich && <LaurelFx stage={stage} id={id} />}
        {rich && <LaurelLevel level={level} />}
      </svg>
    </span>
  )
}
