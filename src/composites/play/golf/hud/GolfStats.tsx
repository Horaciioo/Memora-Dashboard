'use client'

import { Button } from '@/components/elements/actions/Button'
import { GolfPixelEdge } from '@/composites/play/golf/hud/GolfPixelEdge'
import { GolfScorecard } from '@/composites/play/golf/hud/GolfScorecard'
import type { GolfScorecardProps } from '@/composites/play/golf/hud/GolfScorecard'
import { GolfTrophy } from '@/composites/play/golf/hud/GolfTrophy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_SCORECARD } from '@/declarations/ui/variants'

/**
 * Ranking laid over the course, strokes hole by hole
 * @param {GolfScorecardProps & Object} props - Cards and close handler
 * @return {JSX.Element}
 */

export const GolfStats = ({ onClose, ...card }: GolfScorecardProps & { onClose: () => void }) => (
  <div className={GOLF_SCORECARD.overlay} onClick={onClose}>
    <div className={GOLF_SCORECARD.frame} onClick={(event) => event.stopPropagation()}>
      <section className={GOLF_SCORECARD.frameCard} aria-label={GOLF_BOARD_COPY.ranking}>
        <h2 className={GOLF_SCORECARD.title}>{GOLF_BOARD_COPY.ranking}</h2>
        <GolfScorecard {...card} />
        <div className={GOLF_SCORECARD.close}>
          <Button variant="arcadeGhostSmall" onClick={onClose}>
            {GOLF_BOARD_COPY.closeStats}
          </Button>
        </div>
      </section>
      <GolfPixelEdge />
      <GolfTrophy />
    </div>
  </div>
)
