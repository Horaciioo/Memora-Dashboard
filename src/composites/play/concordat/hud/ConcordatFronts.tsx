'use client'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { troopFigure } from '@/core/lib/play/concordat'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatIntents } from '@/utils/constants/concordat'

// Pushes shown at once
const LISTED = 4

export interface ConcordatFrontsProps {
  client: ConcordatClientState
  names: string[]
  act: (body: Record<string, unknown>) => Promise<boolean>
}

/**
 * My pushes in progress, one chip each with the troops left and a cancel
 * @param {ConcordatFrontsProps} props - Game
 * @return {JSX.Element | null}
 */

export const ConcordatFronts = ({ client, names, act }: ConcordatFrontsProps) => {
  const mine = client.corps.filter((corps) => corps.owner === client.me)
  if (!mine.length) return null

  return (
    <div className={CONCORDAT_HUD.fronts}>
      {mine.slice(0, LISTED).map((corps) => (
        <div key={corps.target} className={CONCORDAT_HUD.front}>
          <span className={CONCORDAT_HUD.frontTroops}>{troopFigure(corps.troops)}</span>
          <span className={CONCORDAT_HUD.frontName}>
            {corps.target ? names[corps.target] : CONCORDAT_HUD_COPY.free}
          </span>
          <button
            type="button"
            className={CONCORDAT_HUD.frontCancel}
            title={CONCORDAT_HUD_COPY.cancelPush}
            aria-label={CONCORDAT_HUD_COPY.cancelPush}
            onClick={() => void act({ type: ConcordatIntents.Retreat, target: corps.target })}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
