'use client'

import type { CSSProperties, ReactNode } from 'react'

import { ConcordatCoin } from '@/composites/play/concordat/hud/ConcordatCoin'
import { CONCORDAT_STAT_GLYPHS } from '@/declarations/play/concordat/glyphs'
import { ConcordatArsenal } from '@/composites/play/concordat/hud/ConcordatArsenal'
import { ConcordatCorps } from '@/composites/play/concordat/hud/ConcordatCorps'
import type { ConcordatCorpsProps } from '@/composites/play/concordat/hud/ConcordatCorps'
import { ConcordatEngage } from '@/composites/play/concordat/hud/ConcordatEngage'
import { troopFigure } from '@/core/lib/play/concordat'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_HUD_COPY, CONCORDAT_STAT_TONES } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'

export interface ConcordatPillProps extends ConcordatCorpsProps {
  figures: { key: string; caption: string; figure: ReactNode }[]
}

/**
 * The one permanent box: figures, engagement and corps
 * @param {ConcordatPillProps} props - Game and figures
 * @return {JSX.Element}
 */

export const ConcordatPill = ({ figures, ...corps }: ConcordatPillProps) => {
  const { client } = corps
  const reserve = client.players[client.me - 1]?.troops ?? 0
  const max = client.systems.figures[client.me - 1]?.maxTroops ?? 0
  const growth = client.systems.figures[client.me - 1]?.growth ?? 0
  const share = max > 0 ? Math.max(0, Math.min(1, reserve / max)) : 0

  return (
    <div className={CONCORDAT_HUD.pill}>
      <div className={CONCORDAT_HUD.troopRow}>
        <span className={CONCORDAT_HUD.troopRate}>
          <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="shrink-0">
            <path d={CONCORDAT_STAT_GLYPHS.troops} fill="currentColor" fillRule="evenodd" />
          </svg>
          {`${growth < 0 ? '-' : '+'}${troopFigure(Math.abs(growth))}/s`}
        </span>
        <div
          className={CONCORDAT_HUD.troopBar}
          role="meter"
          aria-label={CONCORDAT_HUD_COPY.troops}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={reserve}
        >
          <div className={CONCORDAT_HUD.troopFill} style={{ width: `${share * 100}%` }} />
          <span className={CONCORDAT_HUD.troopText}>
            {fillPlayMessage(CONCORDAT_HUD_COPY.troopsOf, {
              troops: troopFigure(reserve),
              max: troopFigure(max),
            })}
            <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden className="shrink-0">
              <path d={CONCORDAT_STAT_GLYPHS.troops} fill="currentColor" fillRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
      <div className={CONCORDAT_HUD.stats}>
        {figures
          .filter(({ key }) => key !== 'troops')
          .map(({ key, caption, figure }) => (
            <span key={key} className={CONCORDAT_HUD.stat}>
              <span
                className={CONCORDAT_HUD.statFigure}
                style={{ '--tone': CONCORDAT_STAT_TONES[key] } as CSSProperties}
              >
                {figure}
              </span>
              {key === 'gold' ? (
                <ConcordatCoin size={18} title={caption} className="shrink-0 self-center" />
              ) : (
                <span className={CONCORDAT_HUD.statCaption}>{caption}</span>
              )}
            </span>
          ))}
      </div>
      <div className={CONCORDAT_HUD.row} aria-label={CONCORDAT_HUD_COPY.engage}>
        <ConcordatEngage reserve={corps.client.players[corps.client.me - 1]?.troops ?? 0} />
        <ConcordatCorps {...corps} />
      </div>
      <ConcordatArsenal client={corps.client} />
    </div>
  )
}
