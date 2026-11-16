'use client'

import { useState } from 'react'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { playerRgb, rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatIntents } from '@/utils/constants/concordat'

export interface ConcordatCorpsProps {
  client: ConcordatClientState
  names: string[]
  act: (body: Record<string, unknown>) => Promise<boolean>
}

/**
 * Corps key, opens my engagements above the pill with a call back each
 * @param {ConcordatCorpsProps} props - Game
 * @return {JSX.Element | null}
 */

export const ConcordatCorps = ({ client, names, act }: ConcordatCorpsProps) => {
  const [isOpen, setOpen] = useState(false)
  const mine = client.corps.filter((corps) => corps.owner === client.me)
  if (!mine.length) return null

  return (
    <>
      <button
        type="button"
        className={CONCORDAT_HUD.corpsKey}
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
      >
        {CONCORDAT_HUD_COPY.corps}
      </button>
      {isOpen && (
        <div className={CONCORDAT_HUD.corpsList}>
          <ul className={CONCORDAT_HUD.corps}>
            {mine.map((corps) => (
              <li key={corps.target} className={CONCORDAT_HUD.corpsRow}>
                <span
                  className={CONCORDAT_HUD.swatch}
                  style={{
                    background: rgbText(
                      playerRgb(client.players[(corps.target || 1) - 1], CONCORDAT_ART.nation)
                    ),
                  }}
                />
                <span className={CONCORDAT_HUD.corpsName}>
                  {corps.target ? names[corps.target] : CONCORDAT_HUD_COPY.free}
                </span>
                <span className={CONCORDAT_HUD.corpsTroops}>{corps.troops}</span>
                <button
                  type="button"
                  className={CONCORDAT_HUD.retreat}
                  onClick={() => void act({ type: ConcordatIntents.Retreat, target: corps.target })}
                >
                  {CONCORDAT_HUD_COPY.retreat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
