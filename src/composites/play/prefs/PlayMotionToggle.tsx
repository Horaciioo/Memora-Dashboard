'use client'

import { PlayPrefRow } from '@/composites/play/prefs/PlayPrefRow'
import { usePlayMotionStore } from '@/core/store/play/playMotion'
import { PLAY_MOBILE_COPY } from '@/declarations/play'

/**
 * Switch for the heavy animations
 * @return {JSX.Element}
 */

export const PlayMotionToggle = () => {
  const { isLight, toggle } = usePlayMotionStore()

  return (
    <PlayPrefRow
      label={PLAY_MOBILE_COPY.heavyMotion}
      hint={PLAY_MOBILE_COPY.heavyMotionHint}
      checked={!isLight}
      onChange={toggle}
    />
  )
}
