'use client'

import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'

const { engage } = CONCORDAT_ART

/**
 * Engagement share and slider
 * @return {JSX.Element}
 */

export const ConcordatEngage = () => {
  const percent = useConcordatViewStore((state) => state.percent)
  const setPercent = useConcordatViewStore((state) => state.setPercent)

  return (
    <>
      <span className={CONCORDAT_HUD.percent}>
        {fillPlayMessage(CONCORDAT_HUD_COPY.engageValue, { percent })}
      </span>
      <input
        type="range"
        className={CONCORDAT_HUD.slider}
        min={engage.min}
        max={engage.max}
        step={engage.step}
        value={percent}
        title={CONCORDAT_HUD_COPY.engageHint}
        aria-label={CONCORDAT_HUD_COPY.engage}
        onChange={(event) => setPercent(Number(event.target.value))}
      />
    </>
  )
}
