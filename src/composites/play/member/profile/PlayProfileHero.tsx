import type { ReactNode } from 'react'

import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import { playTime } from '@/composites/play/member/stats/playTime'
import { fillPlayMessage, PLAY_HUB_COPY, PLAY_PROFILE_COPY, tierOf } from '@/declarations/play'
import { PLAY_PROFILE_HERO } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'

export interface PlayProfileHeroProps {
  totals: PlayTileTotals
  player: { name: string; avatarUrl: string | null }
  // Presence line beside the tier
  badge?: ReactNode
  // Gestures at the right
  actions?: ReactNode
}

/**
 * Profile card: portrait, level progress, gestures, and the figures worth showing
 * @param {PlayProfileHeroProps} props - Totals, player, presence, gestures
 * @return {JSX.Element}
 */

export const PlayProfileHero = ({ totals, player, badge, actions }: PlayProfileHeroProps) => {
  const { level } = totals
  const { tier } = tierOf(level.level)
  const share = level.needed ? Math.round((level.into / level.needed) * 100) : 100
  const rate = Math.round(
    (totals.winRate ?? (totals.played ? totals.wins / totals.played : 0)) * 100
  )
  // Zeroes say nothing: only what exists is shown
  const stats = [
    { label: PLAY_HUB_COPY.statPlayed, value: totals.played },
    { label: PLAY_HUB_COPY.recordWins, value: totals.wins },
    {
      label: PLAY_PROFILE_COPY.rate,
      value: `${rate}${PLAY_HUB_COPY.percentUnit}`,
    },
    { label: PLAY_HUB_COPY.statStreak, value: totals.bestStreak || null },
    { label: PLAY_HUB_COPY.statTournaments, value: totals.tournamentsWon || null },
    {
      label: PLAY_HUB_COPY.statTime,
      value: totals.playSeconds ? playTime(totals.playSeconds) : null,
    },
  ].filter((stat) => totals.played > 0 && stat.value !== null)

  return (
    <section className={PLAY_PROFILE_HERO.root}>
      <span className={PLAY_PROFILE_HERO.glow} aria-hidden="true" />
      <div className={PLAY_PROFILE_HERO.main}>
        <LevelFrame level={level.level} name={player.name} src={player.avatarUrl} size="xl" />
        <div className={PLAY_PROFILE_HERO.body}>
          <div className={PLAY_PROFILE_HERO.kickers}>
            <p className={PLAY_PROFILE_HERO.kicker}>{tier.label}</p>
            {badge}
          </div>
          <h2 className={PLAY_PROFILE_HERO.name}>{player.name}</h2>
          <div className={PLAY_PROFILE_HERO.xp}>
            <span className={PLAY_PROFILE_HERO.track} aria-hidden="true">
              <span className={PLAY_PROFILE_HERO.fill} style={{ width: `${share}%` }} />
            </span>
            <p className={PLAY_PROFILE_HERO.xpNote}>
              <span>{fillPlayMessage(PLAY_HUB_COPY.xp, { xp: totals.xp })}</span>
              <span>
                {level.needed
                  ? fillPlayMessage(PLAY_HUB_COPY.toNext, {
                      left: level.needed - level.into,
                      next: level.level + 1,
                    })
                  : PLAY_HUB_COPY.maxed}
              </span>
            </p>
          </div>
        </div>
        {actions}
      </div>
      {stats.length > 0 && (
        <dl className={PLAY_PROFILE_HERO.strip}>
          {stats.map(({ label, value }) => (
            <div key={label} className={PLAY_PROFILE_HERO.stat}>
              <dd className={PLAY_PROFILE_HERO.statValue}>{value}</dd>
              <dt className={PLAY_PROFILE_HERO.statLabel}>{label}</dt>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
