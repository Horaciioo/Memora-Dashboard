import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import type { PlayTier } from '@/declarations/play'
import { PLAY_CAREER, PLAY_ME, PLAY_STATS } from '@/declarations/ui/variants'
import type { PlayLevelView } from '@/types/play'

/**
 * Level of the player: tier, number, progress and XP left
 * @param {Object} props - Level
 * @param {PlayLevelView} props.level - Level reached
 * @param {PlayTier} props.tier - Tier of this level
 * @return {JSX.Element}
 */

export const PlayMeLevel = ({ level, tier }: { level: PlayLevelView; tier: PlayTier }) => (
  <div className={PLAY_ME.level}>
    <div className={PLAY_ME.levelHead}>
      <span className={PLAY_ME.levelNumber}>
        {fillPlayMessage(PLAY_HUB_COPY.level, { level: level.level })}
      </span>
      <span className={PLAY_CAREER.heroKicker}>{tier.label}</span>
    </div>
    <PlayLevelBar share={levelShare(level)} isThin />
    <span className={PLAY_STATS.caption}>
      {level.needed
        ? fillPlayMessage(PLAY_HUB_COPY.toNext, {
            left: level.needed - level.into,
            next: level.level + 1,
          })
        : PLAY_HUB_COPY.maxed}
    </span>
  </div>
)
