'use client'

import dynamic from 'next/dynamic'

import { GolfResult } from '@/composites/play/golf/GolfResult'
import { GolfBreak } from '@/composites/play/golf/hud/GolfBreak'
import { GolfCountdown } from '@/composites/play/golf/hud/GolfCountdown'
import { GolfFooter } from '@/composites/play/golf/hud/GolfFooter'
import { GolfHud } from '@/composites/play/golf/hud/GolfHud'
import { golfStatus } from '@/composites/play/golf/status'
import type { GolfFace } from '@/composites/play/golf/types'
import { playGolfSound, useGolfTable } from '@/composites/play/golf/useGolfTable'
import { useGolfBoard } from '@/core/hooks/data/play/useGolfBoard'
import { useGolfStroke } from '@/core/hooks/data/play/useGolfStroke'
import { useGolfPhase } from '@/core/hooks/interaction/golf/useGolfPhase'
import { canPlaceAt, compileHole, holesOf, playedCourse } from '@/core/lib/play/golf'
import type { GolfBoardView } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { GOLF_POWERS, GolfPowerTargets } from '@/declarations/play/golf/powers'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { GolfPhases } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'

// Three loaded only on a golf table
const GolfScene = dynamic(() => import('@/composites/play/golf/scene/GolfScene'), {
  ssr: false,
  loading: () => <p className={GOLF_BOARD.loading}>{GOLF_BOARD_COPY.loading}</p>,
})

export interface GolfBoardProps {
  sessionId: string
  board: GolfBoardView
  faces: GolfFace[]
  viewerId: string
  isSeated: boolean
}

/**
 * Golf course screen: the 3D hole with its cards, the scorecard between holes, the podium at the end
 * @param {GolfBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const GolfBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: GolfBoardProps) => {
  const board = useGolfBoard(sessionId, initial)
  const phase = useGolfPhase(board)
  const layouts = holesOf(board.settings)
  const hole = compileHole(layouts[Math.min(board.hole, layouts.length - 1)])
  const table = useGolfTable({ board, hole, phase, viewerId })
  const stroke = useGolfStroke({ sessionId, viewerId, board, hole, motionRef: table.motionRef })
  const offset = board.serverTime - board.receivedAt
  const me = isSeated ? board.players.find((player) => player.accountId === viewerId) : undefined
  const isOpen = phase === GolfPhases.Playing && Boolean(me && !me.isDone)
  const card = {
    players: board.players,
    faces,
    pars: layouts.map((layout) => layout.par),
    viewerId,
  }
  if (phase === GolfPhases.Over) return <GolfResult {...card} />

  // Laid powers wait for a spot
  const playPower = (power: GolfPowerName) => {
    if (GOLF_POWERS.get(power).target === GolfPowerTargets.Place) return table.setPlacing(power)
    playGolfSound('power')
    void stroke.power()
  }
  const place = (x: number, z: number) => {
    if (!table.placing || !canPlaceAt(hole, x, z)) return
    table.setPlacing(null)
    playGolfSound('power')
    void stroke.power({ x, z })
  }
  // Own ball first, then anyone still playing
  const focusId =
    me && !me.isDone
      ? viewerId
      : (board.players.find((player) => !player.isDone && !player.hasLeft)?.accountId ?? viewerId)

  return (
    <div className={GOLF_BOARD.board}>
      <div className={GOLF_BOARD.stage}>
        <GolfScene
          board={board}
          hole={hole}
          coursePaint={GOLF_COURSES.get(playedCourse(board.settings)).paint}
          faces={faces}
          viewerId={viewerId}
          focusId={focusId}
          motionRef={table.motionRef}
          rigRef={table.rigRef}
          canShoot={isOpen}
          placeRadius={table.placing ? (GOLF_POWERS.get(table.placing).reach ?? 0) : null}
          serverOffset={offset}
          onShoot={stroke.shoot}
          onPlace={place}
          onCancel={() => table.setPlacing(null)}
          onOverview={table.toggleView}
        />
        <GolfHud
          board={board}
          faces={faces}
          phase={phase}
          par={hole.par}
          isOverview={table.isOverview}
          onOverview={table.toggleView}
        />
        <GolfFooter
          slot={
            me
              ? {
                  me,
                  serverTime: board.serverTime,
                  canUse: isOpen,
                  isSaving: stroke.isSaving,
                  onUse: playPower,
                }
              : null
          }
          status={golfStatus({ me, phase, par: hole.par })}
          maxStrokes={board.settings.maxStrokes}
          placing={table.placing}
          onCancelPlace={() => table.setPlacing(null)}
        />
        {phase === GolfPhases.Countdown && (
          <GolfCountdown
            hole={board.hole}
            par={hole.par}
            startsAt={board.startsAt}
            serverTime={board.serverTime}
          />
        )}
        {phase === GolfPhases.Closed && board.nextAt && (
          <GolfBreak
            {...card}
            nextAt={board.nextAt}
            serverTime={board.serverTime}
            isLast={board.hole + 1 >= board.holes}
          />
        )}
      </div>
    </div>
  )
}
