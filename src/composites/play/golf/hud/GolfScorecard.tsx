'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import type { GolfFace } from '@/composites/play/golf/types'
import { rankCards } from '@/core/lib/play/golf'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_SCORECARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface GolfScorecardProps {
  players: GolfPlayerState[]
  faces: GolfFace[]
  pars: number[]
  viewerId: string
}

/**
 * Strokes of every player hole by hole, fewest first
 * @param {GolfScorecardProps} props - Cards and pars
 * @return {JSX.Element}
 */

export const GolfScorecard = ({ players, faces, pars, viewerId }: GolfScorecardProps) => {
  const ranked = rankCards(players)
  const parTotal = pars.reduce((sum, par) => sum + par, 0)

  return (
    <div className={GOLF_SCORECARD.scroll}>
      <table className={GOLF_SCORECARD.table}>
        <thead>
          <tr>
            <th className={GOLF_SCORECARD.headCell}>{GOLF_BOARD_COPY.player}</th>
            {pars.map((_, index) => (
              <th key={index} className={GOLF_SCORECARD.headCell}>
                {index + 1}
              </th>
            ))}
            <th className={GOLF_SCORECARD.headCell}>{GOLF_BOARD_COPY.total}</th>
          </tr>
        </thead>
        <tbody>
          <tr className={GOLF_SCORECARD.parRow}>
            <td className={GOLF_SCORECARD.name}>{GOLF_BOARD_COPY.parRow}</td>
            {pars.map((par, index) => (
              <td key={index} className={GOLF_SCORECARD.cell}>
                {par}
              </td>
            ))}
            <td className={GOLF_SCORECARD.total}>{parTotal}</td>
          </tr>
          {ranked.map((player) => {
            const face = faces.find((entry) => entry.accountId === player.accountId)

            return (
              <tr
                key={player.accountId}
                className={cn(
                  GOLF_SCORECARD.row,
                  player.accountId === viewerId && GOLF_SCORECARD.rowMe
                )}
              >
                <td className={GOLF_SCORECARD.name}>
                  <Avatar name={face?.name ?? ''} src={face?.avatarUrl ?? null} size="xs" />
                  {face?.name}
                </td>
                {pars.map((par, index) => {
                  const strokes = player.card[index]

                  return (
                    <td
                      key={index}
                      className={cn(
                        GOLF_SCORECARD.cell,
                        strokes === undefined && GOLF_SCORECARD.cellPending,
                        strokes !== undefined && strokes < par && GOLF_SCORECARD.cellUnder,
                        strokes !== undefined && strokes > par && GOLF_SCORECARD.cellOver
                      )}
                    >
                      {strokes ?? GOLF_BOARD_COPY.pending}
                    </td>
                  )
                })}
                <td className={GOLF_SCORECARD.total}>{player.total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
