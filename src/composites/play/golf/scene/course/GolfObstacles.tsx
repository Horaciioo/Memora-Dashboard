'use client'

import { GolfEdgeBands } from '@/composites/play/golf/scene/obstacles/GolfEdgeBands'
import { GolfHiddenBlocks } from '@/composites/play/golf/scene/obstacles/GolfHiddenBlocks'
import { GolfFan } from '@/composites/play/golf/scene/obstacles/GolfFan'
import { GolfPortal } from '@/composites/play/golf/scene/obstacles/GolfPortal'
import { GolfRailCaps } from '@/composites/play/golf/scene/obstacles/GolfRailCaps'
import { GolfRoundBlocks } from '@/composites/play/golf/scene/obstacles/GolfRoundBlocks'
import { GolfTotem } from '@/composites/play/golf/scene/obstacles/GolfTotem'
import { GolfVortex } from '@/composites/play/golf/scene/obstacles/GolfVortex'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import type { GolfHole, GolfMotion } from '@/core/lib/play/golf'
import type { RefObject } from 'react'

// Pair colours, one per portal pair
const PAIR_PAINT = ['portal', 'portal-exit', 'boost', 'ice'] as const

interface ObstacleProps {
  hole: GolfHole
  paint: GolfPaint
  // Seconds since the hole opened
  clock: () => number
  // Missing on neighbouring holes, hidden blocks stay hidden
  motionRef?: RefObject<GolfMotion>
}

/**
 * Rail caps, ground bands, rounded blocks, portals, black holes, fans and totems of a hole
 * @param {ObstacleProps} props - Hole and clock
 * @return {JSX.Element}
 */

export const GolfObstacles = ({ hole, paint, clock, motionRef }: ObstacleProps) => (
  <>
    <GolfRailCaps hole={hole} paint={paint} />
    <GolfEdgeBands hole={hole} paint={paint} />
    <GolfRoundBlocks hole={hole} paint={paint} />
    {motionRef && <GolfHiddenBlocks blocks={hole.blocks} paint={paint} motionRef={motionRef} />}
    {hole.portals.map((entry, index) => (
      <GolfPortal
        key={entry.id}
        hole={hole}
        entry={entry}
        color={paint[PAIR_PAINT[index % PAIR_PAINT.length]]}
      />
    ))}
    {hole.vortexes.map((entry) => (
      <GolfVortex key={entry.id} hole={hole} paint={paint} entry={entry} />
    ))}
    {hole.fans.map((entry, index) => (
      <GolfFan key={index} hole={hole} paint={paint} clock={clock} entry={entry} />
    ))}
    {hole.totems.map((entry) => (
      <GolfTotem key={entry.id} hole={hole} paint={paint} clock={clock} entry={entry} />
    ))}
  </>
)
