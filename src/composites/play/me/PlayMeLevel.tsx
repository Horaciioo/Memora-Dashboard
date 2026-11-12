import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_ME } from '@/declarations/ui/variants'
import type { PlayLevelView } from '@/types/play'

/**
 * Level progress and XP left
 * @param {Object} props - Level
 * @param {PlayLevelView} props.level - Level reached
 * @return {JSX.Element}
 */

export const PlayMeLevel = ({ level }: { level: PlayLevelView }) => (
  <div className={PLAY_ME.level}>
    <span className={PLAY_ME.levelBar}>
      <span className={PLAY_ME.levelFill} style={{ width: `${levelShare(level)}%` }} />
    </span>
    <span className={PLAY_ME.levelNext}>
      {level.needed
        ? fillPlayMessage(PLAY_HUB_COPY.toNext, {
            left: level.needed - level.into,
            next: level.level + 1,
          })
        : PLAY_HUB_COPY.maxed}
    </span>
  </div>
)
