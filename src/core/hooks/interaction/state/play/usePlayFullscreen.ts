'use client'

import { useEffect } from 'react'

import { usePlayStageStore } from '@/core/store/play/playStage'

/**
 * Keep the store in step with the browser screen, handed back when the room closes
 * @return {void}
 */

export const usePlayFullscreen = () => {
  const setScreen = usePlayStageStore((state) => state.setScreen)

  useEffect(() => {
    const sync = () => setScreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)

    return () => {
      document.removeEventListener('fullscreenchange', sync)
      if (document.fullscreenElement) void document.exitFullscreen()
    }
  }, [setScreen])
}
