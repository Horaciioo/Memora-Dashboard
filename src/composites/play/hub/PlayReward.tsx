'use client'

import type { PlayReward as Reward } from '@/core/hooks/data/play/usePlayReward'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_REWARD } from '@/declarations/ui/variants'

/**
 * Floating XP won and level up burst
 * @param {Object} props - Reward
 * @param {Reward | null} props.reward - Reward on screen
 * @return {JSX.Element | null}
 */

export const PlayReward = ({ reward }: { reward: Reward | null }) => {
  if (!reward) return null

  return (
    <div className={PLAY_REWARD.layer} aria-live="polite">
      <span key={`xp-${reward.id}`} className={PLAY_REWARD.xp}>
        +{reward.gain} {PLAY_HUB_COPY.rewardXp}
      </span>
      {reward.level !== null && (
        <div key={`level-${reward.id}`} className={PLAY_REWARD.level}>
          <span className={PLAY_REWARD.levelCaption}>{PLAY_HUB_COPY.rewardLevel}</span>
          <span className={PLAY_REWARD.levelNumber}>{reward.level}</span>
        </div>
      )}
    </div>
  )
}
