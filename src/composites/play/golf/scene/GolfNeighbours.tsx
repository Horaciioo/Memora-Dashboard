'use client'

import { GolfCourse } from '@/composites/play/golf/scene/GolfCourse'
import { GolfObstacles } from '@/composites/play/golf/scene/GolfObstacles'
import type { neighboursOf } from '@/composites/play/golf/scene/map'
import { GolfSpecks } from '@/composites/play/golf/scene/GolfSpecks'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'

export interface GolfNeighboursProps {
  neighbours: ReturnType<typeof neighboursOf>
  paint: GolfPaint
  clock: () => number
}

/**
 * Other holes of the map, where they stand around the played one
 * @param {GolfNeighboursProps} props - Placed holes, colours
 * @return {JSX.Element}
 */

export const GolfNeighbours = ({ neighbours, paint, clock }: GolfNeighboursProps) => (
  <>
    {neighbours.map(({ rank, hole, at }) => (
      <group key={rank} position={[at[0], 0, at[1]]}>
        <GolfCourse hole={hole} paint={paint} lawnRef={null} />
        <GolfObstacles hole={hole} paint={paint} clock={clock} />
        <GolfSpecks hole={hole} paint={paint} />
      </group>
    ))}
  </>
)
