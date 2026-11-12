'use client'

import { useEffect } from 'react'

import { stageSettled, usePlayStageStore } from '@/core/store/play/playStage'

/**
 * Keep the whole page full screen, dialogs included, in step with the play stage store
 * @return {void}
 */

export const usePlayFullscreen = () => {
  const isFullscreen = usePlayStageStore((state) => state.isFullscreen)
  const leave = usePlayStageStore((state) => state.leave)

  useEffect(() => {
    // Browser mode follows the morph, a viewport change would abort it
    void stageSettled().then(() => {
      if (isFullscreen && !document.fullscreenElement && navigator.userActivation?.isActive)
        void document.documentElement.requestFullscreen?.().catch(() => {})
      if (!isFullscreen && document.fullscreenElement) void document.exitFullscreen()
    })
  }, [isFullscreen])

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
