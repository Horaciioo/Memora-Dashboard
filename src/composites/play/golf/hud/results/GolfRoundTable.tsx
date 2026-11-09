'use client'

import type { GolfFace } from '@/composites/play/golf/types'
import { seatPaint } from '@/composites/play/golf/types'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_PANEL_ROWS } from '@/declarations/play/golf/scene'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_PANEL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface GolfRoundTableProps {
  players: GolfPlayerState[]
  faces: GolfFace[]
  // Hole being played, from zero
  hole: number
  viewerId: string
  // Ball the camera follows
  focusId: string
}

/**
 * Strokes of every player on the hole being played
 * @param {GolfRoundTableProps} props - Players and view
 * @return {JSX.Element}
 */

export const GolfRoundTable = ({
  players,
  faces,
  hole,
  viewerId,
  focusId,
}: GolfRoundTableProps) => {
  const EyeIcon = ICONS.visible
  const present = players.filter((player) => !player.hasLeft)

  return (
    <div className={GOLF_PANEL.scroll}>
      <table className={GOLF_PANEL.table}>
        <thead>
          <tr>
            <th className={GOLF_PANEL.headCell}>{GOLF_BOARD_COPY.player}</th>
            <th className={GOLF_PANEL.headCell}>{GOLF_BOARD_COPY.strokes}</th>
            <th className={GOLF_PANEL.headCell}>{GOLF_BOARD_COPY.holeColumn}</th>
          </tr>
        </thead>
        <tbody>
          {present.map((player) => {
            const face = faces.find((entry) => entry.accountId === player.accountId)

            return (
              <tr
                key={player.accountId}
                className={cn(GOLF_PANEL.row, player.accountId === viewerId && GOLF_PANEL.rowMe)}
              >
                <td className={GOLF_PANEL.name}>
                  {player.accountId === focusId ? (
                    <EyeIcon className={GOLF_PANEL.eye} aria-hidden="true" />
                  ) : (
                    <span className={GOLF_PANEL.eyeSpace} />
                  )}
                  <span className={GOLF_PANEL.nameText}>{face?.name}</span>
                  <span
                    className={GOLF_PANEL.dot}
                    style={{ backgroundColor: face && seatPaint(face.color) }}
                  />
                </td>
                <td className={GOLF_PANEL.cell}>{player.strokes}</td>
                <td className={GOLF_PANEL.cell}>
                  <span className={cn(player.isHoled && GOLF_PANEL.holeMark)}>{hole + 1}</span>
                </td>
              </tr>
            )
          })}
          {Array.from({ length: Math.max(0, GOLF_PANEL_ROWS - present.length) }, (_, index) => (
            <tr key={index} className={GOLF_PANEL.row}>
              <td className={GOLF_PANEL.empty} colSpan={3} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
