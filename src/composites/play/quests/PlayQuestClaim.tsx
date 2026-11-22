'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { claimQuestAction } from '@/app/(dashboard)/play/actions'
import { usePlayCelebrationStore } from '@/core/store/play/playCelebration'
import { PLAY_QUEST_COPY } from '@/declarations/play/quests'
import { PLAY_QUESTS } from '@/declarations/ui/variants'

/**
 * Button taking the reward of a finished quest
 * @param {Object} props - Quest
 * @param {string} props.slot - Quest slot or bonus key
 * @param {boolean} [props.isOnPoster] - White button over a coloured poster
 * @return {JSX.Element}
 */

export const PlayQuestClaim = ({ slot, isOnPoster }: { slot: string; isOnPoster?: boolean }) => {
  const router = useRouter()
  const fire = usePlayCelebrationStore((state) => state.fire)
  const [isPending, start] = useTransition()
  const [isFailed, setFailed] = useState(false)

  const claim = () =>
    start(async () => {
      try {
        setFailed(false)
        const xp = await claimQuestAction(slot)
        if (xp > 0) fire({ kind: 'quest', xp })
        router.refresh()
      } catch {
        setFailed(true)
      }
    })

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        className={isOnPoster ? PLAY_QUESTS.claimOnPoster : PLAY_QUESTS.claim}
        onClick={claim}
      >
        {PLAY_QUEST_COPY.claim}
      </button>
      {isFailed && (
        <span role="alert" className={PLAY_QUESTS.rewardNote}>
          {PLAY_QUEST_COPY.claimFailed}
        </span>
      )}
    </>
  )
}
