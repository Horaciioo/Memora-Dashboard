'use client'

import type { CSSProperties } from 'react'
import { useEffect } from 'react'

import { PlayCelebrationLevel } from '@/composites/play/celebration/PlayCelebrationLevel'
import { PlayCelebrationQuest } from '@/composites/play/celebration/PlayCelebrationQuest'
import { PlayCelebrationTrophy } from '@/composites/play/celebration/PlayCelebrationTrophy'
import { usePlayCelebrationStore } from '@/core/store/play/playCelebration'
import { PLAY_CELEBRATION } from '@/declarations/play'
import { PLAY_CELEBRATION_UI } from '@/declarations/ui/variants'

/**
 * Overlay celebrating a quest, a trophy or a level, one scene at a time
 * @return {JSX.Element | null}
 */

export const PlayCelebration = () => {
  const entry = usePlayCelebrationStore((state) => state.queue[0])
  const next = usePlayCelebrationStore((state) => state.next)

  // Gone after its time, the next one follows
  useEffect(() => {
    if (!entry) return
    const timer = window.setTimeout(next, PLAY_CELEBRATION.shownMs)

    return () => window.clearTimeout(timer)
  }, [entry, next])

  if (!entry) return null

  return (
    <div
      key={entry.id}
      className={PLAY_CELEBRATION_UI.layer}
      style={{ '--cele-ms': `${PLAY_CELEBRATION.shownMs}ms` } as CSSProperties}
      aria-live="polite"
    >
      {entry.kind === 'quest' && <PlayCelebrationQuest xp={entry.xp} />}
      {entry.kind === 'trophy' && <PlayCelebrationTrophy {...entry} />}
      {entry.kind === 'level' && <PlayCelebrationLevel level={entry.level} />}
    </div>
  )
}
