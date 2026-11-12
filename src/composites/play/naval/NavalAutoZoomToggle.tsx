'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { useNavalPrefsStore } from '@/core/store/play/navalPrefs'
import { NAVAL_PREFS_COPY } from '@/declarations/play/naval/copy'
import { PLAY_ONLINE } from '@/declarations/ui/variants'

/**
 * Switch for the automatic camera zoom
 * @return {JSX.Element}
 */

export const NavalAutoZoomToggle = () => {
  const hasAutoZoom = useNavalPrefsStore((state) => state.hasAutoZoom)
  const toggle = useNavalPrefsStore((state) => state.toggleAutoZoom)

  return (
    <section className={PLAY_ONLINE.setting}>
      <Toggle checked={hasAutoZoom} onChange={toggle} label={NAVAL_PREFS_COPY.autoZoom} />
      <p className={PLAY_ONLINE.hint}>{NAVAL_PREFS_COPY.autoZoomHint}</p>
    </section>
  )
}
