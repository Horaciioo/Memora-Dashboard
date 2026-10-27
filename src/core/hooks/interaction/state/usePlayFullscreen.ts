'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'

import { stageSettled, usePlayStageStore } from '@/core/store/playStage'

/**
 * Keep the browser full screen in step with the play stage store
 * @param {RefObject<HTMLElement | null>} target - Element shown full screen
 * @return {void}
 */

export const usePlayFullscreen = (target: RefObject<HTMLElement | null>) => {
  const isFullscreen = usePlayStageStore((state) => state.isFullscreen)
  const leave = usePlayStageStore((state) => state.leave)

  useEffect(() => {
    // Browser mode follows the morph, a viewport change would abort it
    void stageSettled().then(() => {
      if (isFullscreen && !document.fullscreenElement)
        void target.current?.requestFullscreen?.().catch(() => {})
      if (!isFullscreen && document.fullscreenElement) void document.exitFullscreen()
    })
  }, [isFullscreen, target])

  // Escape leaves the browser mode first
  useEffect(() => {
    const sync = () => !document.fullscreenElement && leave()
    document.addEventListener('fullscreenchange', sync)

    return () => {
      document.removeEventListener('fullscreenchange', sync)
      leave()
      if (document.fullscreenElement) void document.exitFullscreen()
    }
  }, [leave])
}
