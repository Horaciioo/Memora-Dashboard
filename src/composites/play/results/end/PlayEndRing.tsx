'use client'

import { usePlayXpFill } from '@/core/hooks/interaction/state/play/usePlayXpFill'
import { PLAY_XP_TIMING } from '@/declarations/play'
import { PLAY_END_PAGE } from '@/declarations/ui/variants'
import type { PlayRewardLadder } from '@/types/play'
import { cn } from '@/utils/classnames'

// Ring geometry in its own box
const SIZE = 120
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const LENGTH = 2 * Math.PI * RADIUS

/**
 * Level of the game inside a ring that fills with the XP, through the level up when there is one
 * @param {Object} props - Standing
 * @param {PlayRewardLadder} props.ladder - Standing before and after
 * @param {string} props.caption - Word under the level
 * @return {JSX.Element}
 */

export const PlayEndRing = ({ ladder, caption }: { ladder: PlayRewardLadder; caption: string }) => {
  const { level, share, isFilling, hasLeveled } = usePlayXpFill(ladder)

  return (
    <div className={PLAY_END_PAGE.ring} role="img" aria-label={`${caption} ${level}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={PLAY_END_PAGE.ringSvg} aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className={PLAY_END_PAGE.ringTrack}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className={cn(PLAY_END_PAGE.ringFill, isFilling && 'transition-[stroke-dashoffset]')}
          strokeDasharray={LENGTH}
          strokeDashoffset={LENGTH * (1 - share)}
          style={{ transitionDuration: `${PLAY_XP_TIMING.fillMs}ms` }}
        />
      </svg>
      <span key={level} className={cn(PLAY_END_PAGE.ringLevel, hasLeveled && 'play-xp-level')}>
        {level}
      </span>
      <span className={PLAY_END_PAGE.ringCaption}>{caption}</span>
    </div>
  )
}
