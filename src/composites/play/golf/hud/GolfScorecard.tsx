'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import type { GolfFace } from '@/composites/play/golf/types'
import { cardCell, cardVersusPar, parName, rankCards } from '@/core/lib/play/golf'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_SCORECARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface GolfScorecardProps {
  players: GolfPlayerState[]
  faces: GolfFace[]
  holes: number
  // Par of each hole, null in points
  pars?: (number | null)[]
  viewerId: string
}

/**
 * Strokes against par of a hole, zero without par
 * @param {number} strokes - Strokes
 * @param {number | null | undefined} par - Par
 * @return {number} - Gap
 */

const versus = (strokes: number, par: number | null | undefined): number =>
  par === null || par === undefined ? 0 : strokes - par

/**
 * Gap to par as written, E for even
 * @param {number} gap - Strokes over par
 * @return {string} - Text
 */

const gapText = (gap: number): string => (gap === 0 ? 'E' : gap > 0 ? `+${gap}` : `${gap}`)

/**
 * Strokes of every player hole by hole, fewest first
 * @param {GolfScorecardProps} props - Cards
 * @return {JSX.Element}
 */

export const GolfScorecard = ({
  players,
  faces,
  holes,
  pars = [],
  viewerId,
}: GolfScorecardProps) => {
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
        {pars.some((par) => par !== null) && (
          <tbody>
            <tr className={GOLF_SCORECARD.parRow}>
              <td className={GOLF_SCORECARD.parCell}>{GOLF_BOARD_COPY.par}</td>
              {columns.map((index) => (
                <td key={index} className={GOLF_SCORECARD.parCell}>
                  {pars[index] ?? ''}
                </td>
              ))}
              <td className={GOLF_SCORECARD.parCell}>
                {pars.reduce<number>((sum, par) => sum + (par ?? 0), 0)}
              </td>
            </tr>
          </tbody>
        )}
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
                        strokes === undefined && GOLF_SCORECARD.cellPending,
                        strokes !== undefined &&
                          versus(strokes, pars[index]) < 0 &&
                          GOLF_SCORECARD.cellUnder
                      )}
                      title={
                        strokes !== undefined && pars[index] != null
                          ? GOLF_BOARD_COPY.parNames[parName(strokes, pars[index])]
                          : undefined
                      }
                    >
                      {strokes === undefined ? GOLF_BOARD_COPY.pending : cardCell(strokes)}
                    </td>
                  )
                })}
                <td className={GOLF_SCORECARD.total}>
                  {cardCell(player.total)}
                  {pars.some((par) => par !== null) && (
                    <span className={GOLF_SCORECARD.gap}>
                      {gapText(cardVersusPar(player.card, pars))}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
