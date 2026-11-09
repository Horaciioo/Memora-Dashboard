'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { usePlayMotionStore } from '@/core/store/play/playMotion'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_ONLINE } from '@/declarations/ui/variants'

/**
 * Play settings: sound and heavy animations
 * @return {JSX.Element}
 */

export const PlaySettingsPanel = () => {
  const { isLight, toggle } = usePlayMotionStore()

  return (
    <div className={PLAY_ONLINE.settings}>
      <section className={PLAY_ONLINE.setting}>
        <h3 className={PLAY_ONLINE.settingTitle}>{PLAY_MOBILE_COPY.sound}</h3>
        <PlayVolume />
      </section>
      <section className={PLAY_ONLINE.setting}>
        <Toggle checked={!isLight} onChange={toggle} label={PLAY_MOBILE_COPY.heavyMotion} />
        <p className={PLAY_ONLINE.hint}>{PLAY_MOBILE_COPY.heavyMotionHint}</p>
      </section>
    </div>
  )
}
