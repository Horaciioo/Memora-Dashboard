'use client'

import { useState } from 'react'

import { useGolfPrefsStore } from '@/core/store/play/golfPrefs'
import { useNavalPrefsStore } from '@/core/store/play/navalPrefs'
import { usePlayMotionStore } from '@/core/store/play/playMotion'
import { usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { usePlaySoundStore } from '@/core/store/play/playSound'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_VOLUME } from '@/declarations/play/sounds'
import { PLAY_PREF, PLAY_SETTINGS } from '@/declarations/ui/variants'

// How long the confirmation stays, ms
const DONE_MS = 2500

/**
 * Button putting every Play choice kept on the device back to its start
 * @return {JSX.Element}
 */

export const PlayResetPrefs = () => {
  const [isDone, setDone] = useState(false)

  const reset = () => {
    usePlayPrefsStore.getState().reset()
    usePlayMotionStore.setState({ isLight: false })
    usePlaySoundStore.setState({ isMuted: false, master: PLAY_VOLUME.master, games: {} })
    useGolfPrefsStore.setState({
      showPlayers: true,
      hasTrails: true,
      hasMist: true,
      hasSpecks: true,
      isLight: false,
    })
    useNavalPrefsStore.setState({ hasAutoZoom: true })
    setDone(true)
    setTimeout(() => setDone(false), DONE_MS)
  }

  return (
    <div className="flex flex-col">
      <button type="button" className={PLAY_SETTINGS.reset} onClick={reset} aria-live="polite">
        {isDone ? PLAY_HUB_COPY.settingsResetDone : PLAY_HUB_COPY.settingsReset}
      </button>
      <span className={`${PLAY_PREF.hint} px-3 pb-1.5`}>{PLAY_HUB_COPY.settingsResetHint}</span>
    </div>
  )
}
