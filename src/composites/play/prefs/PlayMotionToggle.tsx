'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { usePlayMotionStore } from '@/core/store/play/playMotion'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_ONLINE } from '@/declarations/ui/variants'

/**
 * Switch for the heavy animations
 * @return {JSX.Element}
 */

export const PlayMotionToggle = () => {
  const { isLight, toggle } = usePlayMotionStore()

  return (
    <section className={PLAY_ONLINE.setting}>
      <Toggle checked={!isLight} onChange={toggle} label={PLAY_MOBILE_COPY.heavyMotion} />
      <p className={PLAY_ONLINE.hint}>{PLAY_MOBILE_COPY.heavyMotionHint}</p>
    </section>
  )
}
