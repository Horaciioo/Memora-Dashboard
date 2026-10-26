'use client'

import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { GolfViewKeys } from '@/composites/play/golf/hud/GolfViewKeys'
import type { GolfFace } from '@/composites/play/golf/types'
import { seatPaint } from '@/composites/play/golf/types'
import { useGolfClockSound } from '@/composites/play/golf/useGolfClockSound'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import type { GolfBoardState } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatCountdown } from '@/utils/format/countdown'
import { GolfPhases } from '@/utils/constants/play'
import type { GolfPhaseName } from '@/utils/constants/play'

export interface GolfHudProps {
  board: GolfBoardState
  faces: GolfFace[]
  phase: GolfPhaseName
  // Own strokes, none for spectators
  strokes: number | null
  maxStrokes: number
  isOverview: boolean
  onOverview: () => void
}

/**
 * Top of the course: hole and clock, every player's strokes, view and sound keys
 * @param {GolfHudProps} props - Board and view
 * @return {JSX.Element}
 */

export const GolfHud = ({
  board,
  faces,
  phase,
  strokes,
  maxStrokes,
  isOverview,
  onOverview,
}: GolfHudProps) => {
  const now = useServerNow(new Date(board.serverTime))
  const left = phase === GolfPhases.Playing ? (board.endsAt - now) / 1000 : 0
  useGolfClockSound(left)
  const DoneIcon = ICONS.golfFlag

  return (
    <div className={GOLF_BOARD.top}>
      <div className={GOLF_BOARD.hole}>
        <div className={GOLF_BOARD.holeBlock}>
          <span className={GOLF_BOARD.caption}>
            {fillPlayMessage(GOLF_BOARD_COPY.holeOf, { index: board.hole + 1, total: board.holes })}
          </span>
        </div>
        <span className={GOLF_BOARD.divider} aria-hidden="true" />
        {strokes !== null && (
          <>
            <div className={GOLF_BOARD.holeBlock}>
              <span className={GOLF_BOARD.caption}>{GOLF_BOARD_COPY.stroke}</span>
              <span key={strokes} className={cn(GOLF_BOARD.figure, 'play-pop')}>
                {Number.isFinite(maxStrokes) ? `${strokes} / ${maxStrokes}` : strokes}
              </span>
            </div>
            <span className={GOLF_BOARD.divider} aria-hidden="true" />
          </>
        )}
        <div className={GOLF_BOARD.holeBlock}>
          <span className={GOLF_BOARD.caption}>{GOLF_BOARD_COPY.clock}</span>
          <span
            className={cn(
              GOLF_BOARD.figure,
              left > 0 && left <= GOLF_SETTINGS.clockLowSeconds && GOLF_BOARD.clockLow
            )}
          >
            {formatCountdown(
              phase === GolfPhases.Countdown ? (board.endsAt - board.startsAt) / 1000 : left
            )}
          </span>
        </div>
      </div>

      <ul className={GOLF_BOARD.players}>
        {board.players.map((player) => {
          const face = faces.find((entry) => entry.accountId === player.accountId)
          if (!face) return null

          return (
            <li
              key={player.accountId}
              className={cn(GOLF_BOARD.player, player.hasLeft && GOLF_BOARD.playerGone)}
              title={face.name}
            >
              <span
                className={GOLF_BOARD.playerFace}
                style={{ '--tw-ring-color': seatPaint(face.color) } as CSSProperties}
              >
                <Avatar name={face.name} src={face.avatarUrl} size="sm" />
              </span>
              {player.isHoled && (
                <span className={GOLF_BOARD.playerMark}>
                  <DoneIcon className={GOLF_BOARD.playerMarkIcon} aria-hidden="true" />
                </span>
              )}
              <span className={GOLF_BOARD.playerStrokes}>{player.strokes}</span>
            </li>
          )
        })}
      </ul>

      <GolfViewKeys isOverview={isOverview} onOverview={onOverview} />
    </div>
  )
}
