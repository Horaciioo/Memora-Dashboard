'use client'

import { troopFigure } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'

const { engage } = CONCORDAT_ART

export interface ConcordatEngageProps {
  reserve: number
}

/**
 * Engagement share, troops sent and slider
 * @param {ConcordatEngageProps} props - Troops at hand
 * @return {JSX.Element}
 */

export const ConcordatEngage = ({ reserve }: ConcordatEngageProps) => {
  const percent = useConcordatViewStore((state) => state.percent)
  const setPercent = useConcordatViewStore((state) => state.setPercent)

  return (
    <>
      <label className={CONCORDAT_HUD.percentField}>
        <input
          type="number"
          className={CONCORDAT_HUD.percentInput}
          min={engage.min}
          max={engage.max}
          step={engage.step}
          value={percent}
          aria-label={CONCORDAT_HUD_COPY.engage}
          onChange={(event) => setPercent(Math.round(Number(event.target.value)) || engage.min)}
        />
        %
        <span className={CONCORDAT_HUD.percentSent}>
          ({troopFigure(Math.floor((reserve * percent) / 100))})
        </span>
      </label>
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
