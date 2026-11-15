import { memo, useMemo } from 'react'

import { DECOR_ART } from '@/composites/play/stopgo/board/decorArt'
import { decorOf } from '@/core/lib/play/stopgo'
import type { StopGoTrackPlan } from '@/core/lib/play/stopgo'

export interface StopGoDecorProps {
  plan: StopGoTrackPlan
  seed: string
  map: number
}

/**
 * Scenery of one map, placed once per seed
 * @param {StopGoDecorProps} props - Track, seed and map
 * @return {JSX.Element}
 */

export const StopGoDecor = memo(({ plan, seed, map }: StopGoDecorProps) => {
  const items = useMemo(() => decorOf(plan, seed, map), [plan, seed, map])

  return (
    <g>
      {items.map((item) => {
        const Art = DECOR_ART[item.kind]

        return (
          <g key={item.id} transform={`translate(${item.x.toFixed(1)} ${item.y.toFixed(1)})`}>
            {Art(item)}
          </g>
        )
      })}
    </g>
  )
})

StopGoDecor.displayName = 'StopGoDecor'
