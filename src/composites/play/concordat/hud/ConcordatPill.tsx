'use client'

import { ConcordatCoin } from '@/composites/play/concordat/hud/ConcordatCoin'
import { CONCORDAT_STAT_GLYPHS } from '@/declarations/play/concordat/glyphs'
import { ConcordatArsenal } from '@/composites/play/concordat/hud/ConcordatArsenal'
import { ConcordatCorps } from '@/composites/play/concordat/hud/ConcordatCorps'
import type { ConcordatCorpsProps } from '@/composites/play/concordat/hud/ConcordatCorps'
import { ConcordatEngage } from '@/composites/play/concordat/hud/ConcordatEngage'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'

export interface ConcordatPillProps extends ConcordatCorpsProps {
  figures: { key: string; caption: string; figure: number | string }[]
}

/**
 * The one permanent box: figures, engagement and corps
 * @param {ConcordatPillProps} props - Game and figures
 * @return {JSX.Element}
 */

export const ConcordatPill = ({ figures, ...corps }: ConcordatPillProps) => (
  <div className={CONCORDAT_HUD.pill}>
    <div className={CONCORDAT_HUD.stats}>
      {figures.map(({ key, caption, figure }) => (
        <span key={key} className={CONCORDAT_HUD.stat}>
          <span className={CONCORDAT_HUD.statFigure}>{figure}</span>
          {key === 'gold' ? (
            <ConcordatCoin size={18} title={caption} className="shrink-0 self-center" />
          ) : key === 'troops' ? (
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              role="img"
              aria-label={caption}
              className="shrink-0 self-center text-[var(--play-ink-faint)]"
            >
              <title>{caption}</title>
              <path d={CONCORDAT_STAT_GLYPHS.troops} fill="currentColor" fillRule="evenodd" />
            </svg>
          ) : (
            <span className={CONCORDAT_HUD.statCaption}>{caption}</span>
          )}
        </span>
      ))}
    </div>
    <div className={CONCORDAT_HUD.row} aria-label={CONCORDAT_HUD_COPY.engage}>
      <ConcordatEngage />
      <ConcordatCorps {...corps} />
    </div>
    <ConcordatArsenal client={corps.client} />
  </div>
)
