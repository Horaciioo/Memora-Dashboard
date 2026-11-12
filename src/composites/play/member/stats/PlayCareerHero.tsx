import type { CSSProperties } from 'react'

import { PlayCareerFacts } from '@/composites/play/member/stats/PlayCareerFacts'
import { PlayLevelRing } from '@/composites/play/brand/PlayLevelRing'
import type { PlayLevelRingProps } from '@/composites/play/brand/PlayLevelRing'
import { fillPlayMessage, PLAY_HUB_COPY, tierOf } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayProfileView, PlayTotalsView } from '@/types/play'

export interface PlayCareerHeroProps {
  totals: PlayTotalsView
  player: PlayLevelRingProps['player']
  // Per-game figures, global view only
  games?: PlayProfileView['games']
}

/**
 * Rank card: the level ring, the XP left
 * @param {PlayCareerHeroProps} props - Totals and player
 * @return {JSX.Element}
 */

export const PlayCareerHero = ({ totals, player, games }: PlayCareerHeroProps) => {
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
        {games && <PlayCareerFacts games={games} />}
      </div>
    </section>
  )
}
