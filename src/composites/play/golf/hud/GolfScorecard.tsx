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
  holes: number
  viewerId: string
}

/**
 * Strokes of every player hole by hole, fewest first
 * @param {GolfScorecardProps} props - Cards
 * @return {JSX.Element}
 */

export const GolfScorecard = ({ players, faces, holes, viewerId }: GolfScorecardProps) => {
  const ranked = rankCards(players)
  const columns = Array.from({ length: holes }, (_, index) => index)

  return (
    <div className={GOLF_SCORECARD.scroll}>
      <table className={GOLF_SCORECARD.table}>
        <thead>
          <tr>
            <th className={GOLF_SCORECARD.headCell}>{GOLF_BOARD_COPY.player}</th>
            {columns.map((index) => (
              <th key={index} className={GOLF_SCORECARD.headCell}>
                {index + 1}
              </th>
            ))}
            <th className={GOLF_SCORECARD.headCell}>{GOLF_BOARD_COPY.total}</th>
          </tr>
        </thead>
        <tbody>
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
                {columns.map((index) => {
                  const strokes = player.card[index]

                  return (
                    <td
                      key={index}
                      className={cn(
                        GOLF_SCORECARD.cell,
                        strokes === undefined && GOLF_SCORECARD.cellPending
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
