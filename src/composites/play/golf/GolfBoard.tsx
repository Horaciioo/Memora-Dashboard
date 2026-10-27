'use client'

import dynamic from 'next/dynamic'
import type { CSSProperties } from 'react'

import { GolfResult } from '@/composites/play/golf/GolfResult'
import { GolfStats } from '@/composites/play/golf/hud/GolfStats'
import { GolfBreak } from '@/composites/play/golf/hud/GolfBreak'
import { GolfCheer } from '@/composites/play/golf/hud/GolfCheer'
import { GolfCountdown } from '@/composites/play/golf/hud/GolfCountdown'
import { GolfFooter } from '@/composites/play/golf/hud/GolfFooter'
import { GolfFrost } from '@/composites/play/golf/hud/GolfFrost'
import { GolfPowerCue } from '@/composites/play/golf/hud/GolfPowerCue'
import { GolfHud } from '@/composites/play/golf/hud/GolfHud'
import { golfStatus } from '@/composites/play/golf/status'
import type { GolfFace } from '@/composites/play/golf/types'
import { playGolfSound } from '@/composites/play/golf/sound'
import { useGolfSounds } from '@/composites/play/golf/useGolfSounds'
import { useGolfTable } from '@/composites/play/golf/useGolfTable'
import { usePlayStageStore } from '@/core/store/playStage'
import { useGolfBoard } from '@/core/hooks/data/play/useGolfBoard'
import { useGolfStroke } from '@/core/hooks/data/play/useGolfStroke'
import { useGolfPowerCue } from '@/core/hooks/interaction/golf/useGolfPowerCue'
import { useGolfPhase } from '@/core/hooks/interaction/golf/useGolfPhase'
import {
  canPlaceAt,
  closestRival,
  courseAt,
  holeFor,
  holesOf,
  strokeCeiling,
} from '@/core/lib/play/golf'
import type { GolfBoardView } from '@/core/lib/play/golf'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { golfHudTones } from '@/declarations/play/golf/paint'
import { GOLF_POWERS, GolfPowerTargets } from '@/declarations/play/golf/powers'
import { GOLF_POWER_SOUNDS } from '@/declarations/play/golf/sounds'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { GolfPhases } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

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
  const isFullscreen = usePlayStageStore((state) => state.isFullscreen)
  const phase = useGolfPhase(board)
  const layouts = holesOf(board.settings)
  const layout = layouts[Math.min(board.hole, layouts.length - 1)]
  const hole = holeFor(layout, board.settings)
  const table = useGolfTable({ board, hole, phase, viewerId })
  const stroke = useGolfStroke({ sessionId, viewerId, board, hole, motionRef: table.motionRef })
  const cue = useGolfPowerCue(
    isSeated ? board.players.find((player) => player.accountId === viewerId) : undefined,
    board.serverTime
  )
  const courseKey = courseAt(board.settings, board.hole)
  const course = GOLF_COURSES.get(courseKey)
  useGolfSounds({ board, viewerId, cue })
  const offset = board.serverTime - board.receivedAt
  const me = isSeated ? board.players.find((player) => player.accountId === viewerId) : undefined
  const isOpen = phase === GolfPhases.Playing && Boolean(me && !me.isDone)
  const card = {
    players: board.players,
    faces,
    holes: layouts.length,
    viewerId,
  }
  if (phase === GolfPhases.Over) return <GolfResult {...card} />

  // Laid powers wait for a spot, a swap takes the best placed rival until the picker lands
  const playPower = (power: GolfPowerName, slot: number) => {
    const { target } = GOLF_POWERS.get(power)
    if (target === GolfPowerTargets.Place) return table.setPlacing({ power, slot })
    playGolfSound(GOLF_POWER_SOUNDS[power] ?? 'power')
    const rival =
      target === GolfPowerTargets.Player ? closestRival(board.players, hole, viewerId) : null
    void stroke.power({ slot, ...(rival && { targetId: rival }) })
  }
  const place = (x: number, z: number) => {
    if (!table.placing || !canPlaceAt(hole, x, z)) return
    const { power, slot } = table.placing
    table.setPlacing(null)
    playGolfSound(GOLF_POWER_SOUNDS[power] ?? 'power')
    void stroke.power({ slot, x, z })
  }
  // Own ball first, then anyone still playing
  const focusId =
    me && !me.isDone
      ? viewerId
      : (board.players.find((player) => !player.isDone && !player.hasLeft)?.accountId ?? viewerId)

  return (
    <div className={cn(GOLF_BOARD.board, isFullscreen && GOLF_BOARD.boardFull)}>
      <div
        className={cn(GOLF_BOARD.stage, isFullscreen && GOLF_BOARD.stageFull)}
        style={golfHudTones(course.paint) as CSSProperties}
      >
        <GolfScene
          board={board}
          hole={hole}
          mapHoles={course.holes}
          mapIndex={course.holes.indexOf(layout)}
          mapKey={courseKey}
          coursePaint={course.paint}
          theme={course.theme}
          faces={faces}
          viewerId={viewerId}
          focusId={focusId}
          motionRef={table.motionRef}
          rigRef={table.rigRef}
          canShoot={isOpen}
          placeRadius={table.placing ? (GOLF_POWERS.get(table.placing.power).reach ?? 0) : null}
          serverOffset={offset}
          onShoot={stroke.shoot}
          onPlace={place}
          onCancel={() => table.setPlacing(null)}
          onOverview={table.toggleView}
        />
        <GolfFrost board={board} />
        <GolfHud
          board={board}
          faces={faces}
          phase={phase}
          strokes={me?.strokes ?? null}
          maxStrokes={strokeCeiling(board.settings)}
          isOverview={table.isOverview}
          onOverview={table.toggleView}
        />
        <GolfFooter
          slot={
            me
              ? {
                  me,
                  settings: board.settings,
                  serverTime: board.serverTime,
                  canUse: phase === GolfPhases.Playing,
                  isSaving: stroke.isSaving,
                  onUse: playPower,
                }
              : null
          }
          status={golfStatus({ me, phase })}
          panel={{
            board,
            faces,
            viewerId,
            focusId,
            onStats: () => table.setStatsOpen(true),
          }}
          placing={table.placing?.power ?? null}
          onCancelPlace={() => table.setPlacing(null)}
        />
        {table.isStatsOpen && <GolfStats {...card} onClose={() => table.setStatsOpen(false)} />}
        <GolfCheer />
        <GolfPowerCue cue={cue} />
        {phase === GolfPhases.Countdown && (
          <GolfCountdown
            hole={board.hole}
            course={course.label}
            startsAt={board.startsAt}
            serverTime={board.serverTime}
          />
        )}
        {phase === GolfPhases.Closed && board.nextAt && board.hole + 1 >= board.holes && (
          <GolfBreak
            {...card}
            hole={board.hole}
            nextAt={board.nextAt}
            serverTime={board.serverTime}
            isLast
          />
        )}
      </div>
    </div>
  )
}
