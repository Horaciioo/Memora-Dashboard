'use client'

import type { GolfFace } from '@/composites/play/golf/types'
import { seatPaint } from '@/composites/play/golf/types'
import { useServerAlarm } from '@/core/hooks/interaction/state/useServerAlarm'
import type { GolfBoardState } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY, GOLF_FEED_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GOLF_PANEL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Last things that happened, newest at the bottom
 * @param {Object} props - Board and faces
 * @param {GolfBoardState} props.board - Board
 * @param {GolfFace[]} props.faces - Faces
 * @return {JSX.Element | null}
 */

export const GolfLog = ({ board, faces }: { board: GolfBoardState; faces: GolfFace[] }) => {
  // Read again when the next line lands
  const now = useServerAlarm(
    board.feed.map((line) => new Date(line.at).getTime()),
    board.serverTime - board.receivedAt,
    board.receivedAt
  )
  const lines = board.feed
    .filter((line) => new Date(line.at).getTime() <= now && line.kind in GOLF_FEED_COPY)
    .slice(0, GOLF_SETTINGS.logLines)
    .toReversed()
  if (lines.length === 0) return null

  return (
    <ol className={GOLF_PANEL.log} aria-label={GOLF_BOARD_COPY.feedTitle}>
      {lines.map((line) => {
        const face = faces.find((entry) => entry.accountId === line.accountId)
        const text = fillPlayMessage(
          GOLF_FEED_COPY[line.kind as keyof typeof GOLF_FEED_COPY],
          line.values
        )
        // Power name apart, tinted by its kind
        const [lead, tail = ''] = line.power ? text.split(line.values.power) : [text]

        return (
          <li key={line.id} className={GOLF_PANEL.logLine}>
            <span className={GOLF_PANEL.logHole}>
              {fillPlayMessage(GOLF_BOARD_COPY.feedHole, { hole: line.hole + 1 })}
            </span>{' '}
            <span style={{ color: face && seatPaint(face.color) }}>{face?.name}</span> {lead}
            {line.power && (
              <span
                className={cn(
                  GOLF_POWERS.get(line.power).isBonus
                    ? 'text-[var(--play-golf-card-on)]'
                    : GOLF_PANEL.logName
                )}
              >
                {line.values.power}
              </span>
            )}
            {tail}
          </li>
        )
      })}
    </ol>
  )
}
