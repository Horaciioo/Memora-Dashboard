'use client'

import { useState } from 'react'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { playerRgb, rgbText, troopFigure } from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { fillPlayMessage } from '@/declarations/play/copy'
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
  const percent = useConcordatViewStore((state) => state.percent)
  const mine = client.corps.filter((corps) => corps.owner === client.me)
  const incoming = client.corps.filter((corps) => corps.target === client.me && corps.owner)
  const reserve = client.players[client.me - 1]?.troops ?? 0
  if (!mine.length && !incoming.length) return null

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
            {incoming.map((corps) => (
              <li key={`in-${corps.owner}`} className={CONCORDAT_HUD.corpsRow}>
                <span
                  className={CONCORDAT_HUD.swatch}
                  style={{
                    background: rgbText(
                      playerRgb(client.players[corps.owner - 1], CONCORDAT_ART.nation)
                    ),
                  }}
                />
                <span className={CONCORDAT_HUD.corpsName}>
                  {names[corps.owner]} · {CONCORDAT_HUD_COPY.attacked}
                </span>
                <span className={CONCORDAT_HUD.corpsTroops}>{troopFigure(corps.troops)}</span>
                <button
                  type="button"
                  className={CONCORDAT_HUD.retreat}
                  title={CONCORDAT_HUD_COPY.defendHint}
                  onClick={() =>
                    void act({ type: ConcordatIntents.Defend, target: corps.owner, percent })
                  }
                >
                  {fillPlayMessage(CONCORDAT_HUD_COPY.defend, {
                    troops: troopFigure(Math.floor((reserve * percent) / 100)),
                  })}
                </button>
              </li>
            ))}
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
                <span className={CONCORDAT_HUD.corpsTroops}>{troopFigure(corps.troops)}</span>
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
