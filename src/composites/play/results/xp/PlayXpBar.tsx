'use client'

import { usePlayXpFill } from '@/core/hooks/interaction/state/play/usePlayXpFill'
import { fillPlayMessage, PLAY_XP_COPY, PLAY_XP_TIMING } from '@/declarations/play'
import { PLAY_XP } from '@/declarations/ui/variants'
import type { PlayRewardLadder } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayXpBarProps {
  title: string
  ladder: PlayRewardLadder
  gained: number
}

/**
 * One XP ladder: level chips on both ends and a bar that fills on its own
 * @param {PlayXpBarProps} props - Title, standing before and after, XP gained
 * @return {JSX.Element}
 */

export const PlayXpBar = ({ title, ladder, gained }: PlayXpBarProps) => {
  const { level, share, isFilling, hasLeveled } = usePlayXpFill(ladder)
  const { after } = ladder

  return (
    <section className={PLAY_XP.ladder} aria-label={title}>
      <p className={PLAY_XP.caption}>{title}</p>
      <div className={PLAY_XP.row}>
        <span key={level} className={cn(PLAY_XP.badge, hasLeveled && PLAY_XP.badgeUp)}>
          {level}
        </span>
        <div
          className={PLAY_XP.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(share * 100)}
        >
          <div
            className={cn(PLAY_XP.fill, isFilling && 'transition-[width]')}
            style={{ width: `${share * 100}%`, transitionDuration: `${PLAY_XP_TIMING.fillMs}ms` }}
          />
          <div className={PLAY_XP.ticks} />
        </div>
        <span className={PLAY_XP.badge}>{level + 1}</span>
      </div>
      <div className={PLAY_XP.foot}>
        <span className={PLAY_XP.gain}>{fillPlayMessage(PLAY_XP_COPY.gain, { xp: gained })}</span>
        <span className={PLAY_XP.progress}>
          {after.needed
            ? fillPlayMessage(PLAY_XP_COPY.progress, { into: after.into, needed: after.needed })
            : PLAY_XP_COPY.maxed}
        </span>
      </div>
    </section>
  )
}
