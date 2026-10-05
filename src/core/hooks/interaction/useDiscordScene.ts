'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { applyDiscordEvent } from '@/core/lib/replicas/discordScene'
import type { SceneControls } from '@/core/hooks/interaction/useModViewScene'
import type { DiscordReplicaState, DiscordSceneStep } from '@/types/replicas'

/**
 * Play a Discord scene
 * @param {DiscordReplicaState} initial - State at the start
 * @param {DiscordSceneStep[]} steps - Beats in time order
 * @param {Object} [options] - Playback options
 * @param {boolean} [options.autoplay] - Starts on mount
 * @return {{ state: DiscordReplicaState, controls: SceneControls }} - State and controls
 */

export const useDiscordScene = (
  initial: DiscordReplicaState,
  steps: DiscordSceneStep[],
  { autoplay = true }: { autoplay?: boolean } = {}
): { state: DiscordReplicaState; controls: SceneControls } => {
  const [state, setState] = useState<DiscordReplicaState>(initial)
  const [isPlaying, setPlaying] = useState(autoplay)
  const [cursor, setCursor] = useState(0)
  // Elapsed time kept across pauses
  const elapsed = useRef(0)
  const startedAt = useRef<number | null>(null)

  // Schedule the next beat while playing
  useEffect(() => {
    if (!isPlaying) return
    const step = steps[cursor]
    if (!step) return

    startedAt.current = performance.now() - elapsed.current
    const wait = Math.max(0, step.at - elapsed.current)

    const timer = window.setTimeout(() => {
      elapsed.current = step.at
      setState((current) => applyDiscordEvent(current, step.event))
      setCursor((current) => current + 1)
    }, wait)

    return () => {
      window.clearTimeout(timer)
      // Keep the time already spent waiting
      if (startedAt.current !== null) elapsed.current = performance.now() - startedAt.current
    }
  }, [cursor, isPlaying, steps])

  const restart = useCallback(() => {
    elapsed.current = 0
    setState(initial)
    setCursor(0)
    setPlaying(true)
  }, [initial])

  return {
    state,
    controls: {
      isPlaying,
      isOver: cursor >= steps.length,
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      restart,
    },
  }
}
