'use client'

import { GolfPowerOrb } from '@/composites/play/golf/GolfPowerOrb'
import type { GolfCue } from '@/core/hooks/interaction/golf/useGolfPowerCue'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_BOARD } from '@/declarations/ui/variants'

// Caption per cue
const CUE_CAPTIONS = {
  gained: GOLF_BOARD_COPY.cueGained,
  used: GOLF_BOARD_COPY.cueUsed,
  ended: GOLF_BOARD_COPY.cueEnded,
} as const

/**
 * Big card of a power picked up, played or worn out
 * @param {Object} props - Cue
 * @param {GolfCue | null} props.cue - Cue on screen
 * @return {JSX.Element | null}
 */

export const GolfPowerCue = ({ cue }: { cue: GolfCue | null }) => {
  if (!cue) return null
  const meta = GOLF_POWERS.get(cue.power)

  return (
    <div className={GOLF_BOARD.cue} aria-live="polite">
      <div key={cue.at} className={GOLF_BOARD.cueCard}>
        <span className={GOLF_BOARD.caption}>{CUE_CAPTIONS[cue.kind]}</span>
        <GolfPowerOrb power={cue.power} hasKind className={GOLF_BOARD.cueOrb} />
        <span className={GOLF_BOARD.cueName}>{meta.label}</span>
      </div>
    </div>
  )
}
