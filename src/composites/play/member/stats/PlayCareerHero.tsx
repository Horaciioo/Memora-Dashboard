import type { CSSProperties } from 'react'

import { PlayLevelRing } from '@/composites/play/brand/PlayLevelRing'
import type { PlayLevelRingProps } from '@/composites/play/brand/PlayLevelRing'
import { fillPlayMessage, PLAY_HUB_COPY, PLAY_TIERS, tierOf } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayTotalsView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Share of a rung filled at this level
 * @param {number} index - Rung in the ladder
 * @param {number} level - Player level
 * @return {number} - Percent
 */

const rungShare = (index: number, level: number): number => {
  const { from } = PLAY_TIERS[index]
  const next = PLAY_TIERS[index + 1]
  if (level < from) return 0
  if (!next || level >= next.from) return 100

  return ((level - from) / (next.from - from)) * 100
}

export interface PlayCareerHeroProps {
  totals: PlayTotalsView
  player: PlayLevelRingProps['player']
}

/**
 * Rank card: the level ring, the XP left and the tier ladder
 * @param {PlayCareerHeroProps} props - Totals and player
 * @return {JSX.Element}
 */

export const PlayCareerHero = ({ totals, player }: PlayCareerHeroProps) => {
  const { level } = totals
  const { tier } = tierOf(level.level)

  return (
    <section
      className={PLAY_CAREER.hero}
      style={{ '--tier': `var(${tier.tone})` } as CSSProperties}
    >
      <div className={PLAY_CAREER.heroTop}>
        <PlayLevelRing player={player} level={level} size="hero" tone={tier.tone} />
        <div className={PLAY_CAREER.heroText}>
          <p className={PLAY_CAREER.heroKicker}>{tier.label}</p>
          <h2 className={PLAY_CAREER.heroName}>{player.name}</h2>
          <p className={PLAY_CAREER.heroXp}>
            {fillPlayMessage(PLAY_HUB_COPY.xp, { xp: totals.xp })}
          </p>
          <p className={PLAY_CAREER.heroNext}>
            {level.needed
              ? fillPlayMessage(PLAY_HUB_COPY.toNext, {
                  left: level.needed - level.into,
                  next: level.level + 1,
                })
              : PLAY_HUB_COPY.maxed}
          </p>
        </div>
      </div>

      <ol className={PLAY_CAREER.ladder} aria-label={PLAY_HUB_COPY.ranks}>
        {PLAY_TIERS.map((rung, index) => (
          <li
            key={rung.label}
            className={PLAY_CAREER.rung}
            style={{ '--rung': `var(${rung.tone})` } as CSSProperties}
            aria-current={rung.label === tier.label ? 'step' : undefined}
          >
            <span className={PLAY_CAREER.rungTrack}>
              <span
                className={PLAY_CAREER.rungFill}
                style={{ width: `${rungShare(index, level.level)}%` }}
              />
            </span>
            <span
              className={cn(PLAY_CAREER.rungName, rung.label === tier.label && PLAY_CAREER.rungNow)}
            >
              {rung.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
