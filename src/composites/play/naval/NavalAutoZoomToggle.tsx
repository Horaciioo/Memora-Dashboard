'use client'

import { PlayPrefRow } from '@/composites/play/prefs/PlayPrefRow'
import { useNavalPrefsStore } from '@/core/store/play/navalPrefs'
import { NAVAL_PREFS_COPY } from '@/declarations/play/naval/copy'

/**
 * Switch for the automatic camera zoom
 * @return {JSX.Element}
 */

export const NavalAutoZoomToggle = () => {
  const hasAutoZoom = useNavalPrefsStore((state) => state.hasAutoZoom)
  const toggle = useNavalPrefsStore((state) => state.toggleAutoZoom)

  return (
    <PlayPrefRow
      label={NAVAL_PREFS_COPY.autoZoom}
      hint={NAVAL_PREFS_COPY.autoZoomHint}
      checked={hasAutoZoom}
      onChange={toggle}
    />
  )
}
