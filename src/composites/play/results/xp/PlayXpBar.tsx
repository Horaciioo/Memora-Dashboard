'use client'

import { usePlayXpFill } from '@/core/hooks/interaction/state/play/usePlayXpFill'
import { fillPlayMessage, PLAY_XP_COPY, PLAY_XP_TIMING } from '@/declarations/play'
import { PLAY_XP } from '@/declarations/ui/variants'
import type { PlayRewardLadder, PlayRewardView } from '@/types/play'
import { cn } from '@/utils/classnames'
import { HOUR_MS, MINUTE_MS } from '@/utils/constants/time'

export interface PlayXpBarProps {
  title: string
  ladder: PlayRewardLadder
  gained: number
  // Group quest boost running, lights the bar
  boost?: PlayRewardView['questBoost']
}

// Time left as hours, or minutes under the hour
const boostTimeLeft = (until: string): string => {
  const left = Math.max(0, Date.parse(until) - Date.now())
  const hours = Math.ceil(left / HOUR_MS)

  return left < HOUR_MS
    ? fillPlayMessage(PLAY_XP_COPY.boostMinutes, { n: Math.max(1, Math.ceil(left / MINUTE_MS)) })
    : fillPlayMessage(PLAY_XP_COPY.boostHours, { n: hours })
}

/**
 * One XP ladder: level chips on both ends and a bar that fills on its own
 * @param {PlayXpBarProps} props - Title, standing before and after, XP gained
 * @return {JSX.Element}
 */

export const PlayXpBar = ({ title, ladder, gained, boost = null }: PlayXpBarProps) => {
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
            className={cn(
              PLAY_XP.fill,
              isFilling && 'transition-[width]',
              boost && PLAY_XP.fillFire
            )}
            style={{ width: `${share * 100}%`, transitionDuration: `${PLAY_XP_TIMING.fillMs}ms` }}
          />
          <div className={PLAY_XP.ticks} />
        </div>
        <span className={PLAY_XP.badge}>{level + 1}</span>
      </div>
      <div className={PLAY_XP.foot}>
        <span className={PLAY_XP.gain}>{fillPlayMessage(PLAY_XP_COPY.gain, { xp: gained })}</span>
        {boost && (
          <span className={PLAY_XP.boost}>
            {fillPlayMessage(PLAY_XP_COPY.boost, {
              percent: boost.percent,
              time: boostTimeLeft(boost.until),
            })}
          </span>
        )}
        <span className={PLAY_XP.progress}>
          {after.needed
            ? fillPlayMessage(PLAY_XP_COPY.progress, { into: after.into, needed: after.needed })
            : PLAY_XP_COPY.maxed}
        </span>
      </div>
    </section>
  )
}
