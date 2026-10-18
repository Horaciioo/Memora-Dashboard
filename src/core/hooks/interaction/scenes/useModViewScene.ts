'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { applySceneEvent, applySceneIntent } from '@/core/lib/modview/scene'
import type { ModViewScene, SceneState } from '@/core/lib/modview/scene'
import type { ModViewDriver, ModViewIntent } from '@/types/modview'

/**
 * Playback of a scene
 * @typedef {Object} SceneControls
 * @property {boolean} isPlaying - Running
 * @property {boolean} isOver - Every beat played
 * @property {() => void} play - Start or resume
 * @property {() => void} pause - Hold
 * @property {() => void} restart - Back to the first beat
 */

export interface SceneControls {
  isPlaying: boolean
  isOver: boolean
  play: () => void
  pause: () => void
  restart: () => void
}

/**
 * Drive the Mod View from a scripted scene
 * @param {ModViewScene} scene - Scene to play
 * @param {Object} options - Playback options
 * @param {string} options.actorName - Name the learner acts under
 * @param {boolean} [options.autoplay] - Starts on mount
 * @return {{ driver: ModViewDriver, controls: SceneControls }} - Driver and controls
 */

export const useModViewScene = (
  scene: ModViewScene,
  { actorName, autoplay = true }: { actorName: string; autoplay?: boolean }
): { driver: ModViewDriver; controls: SceneControls } => {
  const initial = useCallback(
    (): SceneState => ({ view: scene.initial, spotlight: null }),
    [scene.initial]
  )
  const [state, setState] = useState<SceneState>(initial)
  const [isPlaying, setPlaying] = useState(autoplay)
  const [cursor, setCursor] = useState(0)
  // Elapsed time kept across pauses
  const elapsed = useRef(0)
  const startedAt = useRef<number | null>(null)
  const sequence = useRef(0)

  // Schedule the next beat while playing
  useEffect(() => {
    if (!isPlaying) return
    const step = scene.steps[cursor]
    if (!step) return

    startedAt.current = performance.now() - elapsed.current
    const wait = Math.max(0, step.at - elapsed.current)

    const timer = window.setTimeout(() => {
      elapsed.current = step.at
      setState((current) => applySceneEvent(current, step.event, scene.maxMessages))
      setCursor((current) => current + 1)
    }, wait)

    return () => {
      window.clearTimeout(timer)
      // Keep the time already spent waiting
      if (startedAt.current !== null) elapsed.current = performance.now() - startedAt.current
    }
  }, [cursor, isPlaying, scene.maxMessages, scene.steps])

  const act = useCallback(
    async (intent: ModViewIntent) => {
      sequence.current += 1
      const id = `scene-${sequence.current}`

      setState((current) =>
        applySceneIntent(current, intent, { name: actorName, at: new Date().toISOString(), id })
      )
    },
    [actorName]
  )

  const restart = useCallback(() => {
    elapsed.current = 0
    setState(initial())
    setCursor(0)
    setPlaying(true)
  }, [initial])

  return {
    driver: { state: state.view, act, spotlight: state.spotlight },
    controls: {
      isPlaying,
      isOver: cursor >= scene.steps.length,
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      restart,
    },
  }
}
