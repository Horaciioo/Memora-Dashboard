'use client'

import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { isEffectActive } from '@/core/lib/play/golf'
import type { GolfBoardState } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { GolfPowers } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Frost creeping in from the screen edges while the course is iced over
 * @param {Object} props - Board
 * @param {GolfBoardState} props.board - Board
 * @return {JSX.Element | null}
 */

export const GolfFrost = ({ board }: { board: GolfBoardState }) => {
  const now = useServerNow(new Date(board.serverTime))
  const ice = board.hazards.find(
    (hazard) => hazard.power === GolfPowers.Ice && isEffectActive(hazard, now)
  )
  if (!ice) return null
  const isMelting = ice.until !== undefined && ice.until - now < GOLF_SCENE.ice.melt * SECOND_MS

  return (
    <div className={cn(GOLF_BOARD.frost, isMelting && GOLF_BOARD.frostMelt)} aria-hidden="true" />
  )
}
