import type { CSSProperties } from 'react'

import { PlayCareerFacts } from '@/composites/play/member/stats/PlayCareerFacts'
import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import { fillPlayMessage, PLAY_HUB_COPY, tierOf } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayProfileView, PlayTotalsView } from '@/types/play'

export interface PlayCareerHeroProps {
  totals: PlayTotalsView
  player: { name: string; avatarUrl: string | null }
  // Per-game figures, global view only
  games?: PlayProfileView['games']
}

/**
 * Rank card: the level frame, the XP left
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
        <LevelFrame level={level.level} name={player.name} src={player.avatarUrl} size="xl" />
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
