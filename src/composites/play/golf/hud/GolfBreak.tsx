'use client'

import { GolfVictory } from '@/composites/play/golf/hud/GolfVictory'
import { GolfScorecard } from '@/composites/play/golf/hud/GolfScorecard'
import type { GolfScorecardProps } from '@/composites/play/golf/hud/GolfScorecard'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { holeWinners } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_SCORECARD } from '@/declarations/ui/variants'

/**
 * Scorecard laid over the course between two holes
 * @param {GolfScorecardProps & Object} props - Cards and timer
 * @return {JSX.Element}
 */

export const GolfBreak = ({
  nextAt,
  serverTime,
  isLast,
  hole,
  ...card
}: GolfScorecardProps & { nextAt: number; serverTime: number; isLast: boolean; hole: number }) => {
  const now = useServerNow(new Date(serverTime))
  const seconds = secondsTo(new Date(nextAt), now)
  const names = holeWinners(card.players, hole).map(
    (player) => card.faces.find((face) => face.accountId === player.accountId)?.name ?? ''
  )

  return (
    <div className={GOLF_SCORECARD.overlay}>
      <section className={GOLF_SCORECARD.card}>
        <div className={GOLF_SCORECARD.head}>
          <h2 className={GOLF_SCORECARD.title}>{GOLF_BOARD_COPY.scorecard}</h2>
          <span className={GOLF_SCORECARD.next}>
            {fillPlayMessage(isLast ? GOLF_BOARD_COPY.results : GOLF_BOARD_COPY.nextHole, {
              seconds,
            })}
          </span>
        </div>
        <GolfVictory names={names} />
        <GolfScorecard {...card} />
      </section>
    </div>
  )
}
