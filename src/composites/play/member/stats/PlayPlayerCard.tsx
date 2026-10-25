import { Avatar } from '@/components/elements/display/Avatar'
import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_HUB_COPY, tierOf } from '@/declarations/play'
import { PLAY_STATS } from '@/declarations/ui/variants'
import type { PlayTotalsView } from '@/types/play'

export interface PlayPlayerCardProps {
  totals: PlayTotalsView
  player: { name: string; avatarUrl: string | null }
}

/**
 * Avatar with its level, rank band and XP progress
 * @param {PlayPlayerCardProps} props - Totals and player
 * @return {JSX.Element}
 */

export const PlayPlayerCard = ({ totals, player }: PlayPlayerCardProps) => {
  const { level } = totals
  const { tier } = tierOf(level.level)

  return (
    <div className={PLAY_STATS.playerFrame}>
      <div className={PLAY_STATS.player}>
        <div className={PLAY_STATS.face}>
          <Avatar name={player.name} src={player.avatarUrl} size="xl" />
          <span className={PLAY_STATS.faceLevel}>{level.level}</span>
        </div>

        <div className={PLAY_STATS.playerText}>
          <div className={PLAY_STATS.playerHead}>
            <span className={PLAY_STATS.playerName}>{player.name}</span>
          </div>
          <div className={PLAY_STATS.playerHead}>
            <span className={PLAY_STATS.tier} style={{ background: `var(${tier.tone})` }}>
              {tier.label}
            </span>
            <span className={PLAY_STATS.chip}>
              {fillPlayMessage(PLAY_HUB_COPY.xp, { xp: totals.xp })}
            </span>
          </div>
          <PlayLevelBar share={levelShare(level)} />
          <span className={PLAY_STATS.caption}>
            {level.needed
              ? fillPlayMessage(PLAY_HUB_COPY.progress, { into: level.into, needed: level.needed })
              : PLAY_HUB_COPY.maxed}
          </span>
        </div>
      </div>
    </div>
  )
}
