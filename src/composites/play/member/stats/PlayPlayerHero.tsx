import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { figuresOf } from '@/composites/play/member/stats/PlayStatTiles'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_HUB_COPY, tierOf } from '@/declarations/play'
import { PLAY_PLAYER } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'

export interface PlayPlayerHeroProps {
  totals: PlayTileTotals
  player: { name: string; avatarUrl: string | null }
  // Game the figures belong to, none for the global ones
  subtitle?: string
}

/**
 * Player sheet: big name, level in the tier colour, then the figures
 * @param {PlayPlayerHeroProps} props - Totals and player
 * @return {JSX.Element}
 */

export const PlayPlayerHero = ({ totals, player, subtitle }: PlayPlayerHeroProps) => {
  const { level } = totals
  const { tier, next } = tierOf(level.level)

  return (
    <section
      className={PLAY_PLAYER.hero}
      style={{ '--tier': `var(${tier.tone})` } as CSSProperties}
    >
      <div className={PLAY_PLAYER.top}>
        <Avatar
          name={player.name}
          src={player.avatarUrl}
          size="xl"
          className={PLAY_PLAYER.avatar}
        />
        <div className={PLAY_PLAYER.who}>
          <h1 className={PLAY_PLAYER.name}>{player.name}</h1>
          <p className={PLAY_PLAYER.tier}>
            {[tier.label, subtitle, fillPlayMessage(PLAY_HUB_COPY.xp, { xp: totals.xp })]
              .filter(Boolean)
              .join(' - ')}
          </p>
        </div>
        <div className={PLAY_PLAYER.level}>
          <span className={PLAY_PLAYER.levelKicker}>{PLAY_HUB_COPY.levelKicker}</span>
          <span className={PLAY_PLAYER.levelValue}>{level.level}</span>
        </div>
      </div>
      <div className={PLAY_PLAYER.track}>
        <span className={PLAY_PLAYER.fill} style={{ width: `${levelShare(level)}%` }} />
      </div>
      <p className={PLAY_PLAYER.caption}>
        {level.needed
          ? fillPlayMessage(PLAY_HUB_COPY.toNext, {
              left: level.needed - level.into,
              next: level.level + 1,
            })
          : PLAY_HUB_COPY.maxed}
        {next &&
          ` - ${fillPlayMessage(PLAY_HUB_COPY.toTier, { tier: next.label, level: next.from })}`}
      </p>
      <dl className={PLAY_PLAYER.figures}>
        {figuresOf(totals).map((figure) => (
          <div key={figure.label} className={PLAY_PLAYER.figure}>
            <dd className={PLAY_PLAYER.figureValue}>{figure.value}</dd>
            <dt className={PLAY_PLAYER.figureLabel}>{figure.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
