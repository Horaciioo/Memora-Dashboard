'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { CSSProperties } from 'react'

import { GolfResult } from '@/composites/play/golf/GolfResult'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import { GolfStats } from '@/composites/play/golf/hud/results/GolfStats'
import { GolfBreak } from '@/composites/play/golf/hud/GolfBreak'
import { GolfCountdown } from '@/composites/play/golf/hud/GolfCountdown'
import { GolfFooter } from '@/composites/play/golf/hud/GolfFooter'
import { GolfFrost } from '@/composites/play/golf/hud/powers/GolfFrost'
import { GolfPowerCue } from '@/composites/play/golf/hud/powers/GolfPowerCue'
import { GolfWatchPicker } from '@/composites/play/golf/hud/GolfWatchPicker'
import { GolfActiveStack } from '@/composites/play/golf/hud/powers/GolfActiveStack'
import { GolfHud } from '@/composites/play/golf/hud/GolfHud'
import { golfStatus } from '@/composites/play/golf/status'
import type { GolfFace } from '@/composites/play/golf/types'
import { playGolfSound } from '@/composites/play/golf/sound'
import { useGolfSounds } from '@/composites/play/golf/useGolfSounds'
import { useGolfTable } from '@/composites/play/golf/useGolfTable'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { useGolfBoard } from '@/core/hooks/data/play/useGolfBoard'
import { useGolfStroke } from '@/core/hooks/data/play/useGolfStroke'
import { useGolfPowerCue } from '@/core/hooks/interaction/golf/useGolfPowerCue'
import { useGolfPhase } from '@/core/hooks/interaction/golf/useGolfPhase'
import { useGolfWatch } from '@/core/hooks/interaction/golf/useGolfWatch'
import { useServerAlarm } from '@/core/hooks/interaction/state/time/useServerAlarm'
import {
  canPlaceAt,
  canTeleportTo,
  courseAt,
  holeFor,
  holesOf,
  parOfLayout,
  strokeCeiling,
  teleportReach,
} from '@/core/lib/play/golf'
import type { GolfBoardState, GolfBoardView } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { golfHudTones } from '@/declarations/play/golf/paint'
import { GOLF_POWERS, GolfPowerTargets } from '@/declarations/play/golf/powers'
import { GOLF_POWER_SOUNDS } from '@/declarations/play/golf/sounds'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { GolfPhases, GolfPowers } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

// Three loaded only on a golf table
const GolfScene = dynamic(() => import('@/composites/play/golf/scene/GolfScene'), {
  ssr: false,
  loading: () => <PlayLoadingScreen isFill />,
})

export interface GolfBoardProps {
  sessionId: string
  board: GolfBoardView
  faces: GolfFace[]
  viewerId: string
  isSeated: boolean
  // Hitboxes and ground spots in the free view
  canInspect?: boolean
}

/**
 * Board whose balls count as holed once they have stopped, not when the stroke is struck
 * @param {GolfBoardState} board - Newest board
 * @return {GolfBoardState} - Board as the screen tells it
 */

const useSettledBall = (board: GolfBoardState): GolfBoardState => {
  const offset = board.serverTime - board.receivedAt
  const now = useServerAlarm(
    board.players.map((player) => (player.isHoled ? player.restsAt : null)),
    offset,
    board.receivedAt
  )

  return {
    ...board,
    players: board.players.map((player) =>
      player.isHoled && player.restsAt > now ? { ...player, isHoled: false } : player
    ),
  }
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
  canInspect = false,
}: GolfBoardProps) => {
  const live = useGolfBoard(sessionId, initial)
  const board = useSettledBall(live)
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
  // Own ball first, then anyone still playing
  const ownFocusId =
    me && !me.isDone
      ? viewerId
      : (board.players.find((player) => !player.isDone && !player.hasLeft)?.accountId ?? viewerId)
  const watch = useGolfWatch(
    board.players.filter((player) => !player.hasLeft).map((player) => player.accountId),
    ownFocusId,
    !isSeated && !table.isFree
  )
  const focusId = isSeated ? ownFocusId : watch.focusId
  // Course spot under the screen centre, for admins fixing a course
  const [probe, setProbe] = useState<[number, number] | null>(null)
  const card = {
    players: board.players,
    faces,
    holes: layouts.length,
    pars: layouts.map(parOfLayout),
    viewerId,
  }
  if (phase === GolfPhases.Over)
    return <GolfResult {...card} sessionId={sessionId} isSeated={isSeated} />

  // Laid powers wait for a spot
  const playPower = (power: GolfPowerName, slot: number) => {
    if (GOLF_POWERS.get(power).target === GolfPowerTargets.Place) {
      return table.setPlacing({ power, slot })
    }
    playGolfSound(GOLF_POWER_SOUNDS[power] ?? 'power')
    void stroke.power({ slot })
  }
  // Teleporter lands near the ball, the server waits for the stop
  const isTeleport = table.placing?.power === GolfPowers.Teleport
  const canPlace = (x: number, z: number) =>
    isTeleport ? me !== undefined && canTeleportTo(hole, me, { x, z }) : canPlaceAt(hole, x, z)
  const place = (x: number, z: number) => {
    if (!table.placing || !canPlace(x, z)) return
    const { power, slot } = table.placing
    table.setPlacing(null)
    playGolfSound(GOLF_POWER_SOUNDS[power] ?? 'power')
    void stroke.power({ slot, x, z })
  }

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
          placeSquare={isTeleport ? teleportReach() : null}
          canPlace={canPlace}
          serverOffset={offset}
          onShoot={stroke.shoot}
          onPlace={place}
          onCancel={() => table.setPlacing(null)}
          onOverview={table.toggleView}
          isInspecting={canInspect && table.isFree}
          onProbe={setProbe}
        />
        {canInspect && table.isFree && probe && (
          <p className={GOLF_BOARD.probe}>
            {fillPlayMessage(GOLF_BOARD_COPY.probe, {
              x: probe[0].toFixed(2),
              z: probe[1].toFixed(2),
            })}
          </p>
        )}
        <GolfFrost board={board} />
        <GolfHud
          board={board}
          faces={faces}
          phase={phase}
          strokes={me?.strokes ?? null}
          par={hole.par}
          maxStrokes={strokeCeiling(board.settings)}
          isOverview={table.isOverview}
          onOverview={table.toggleView}
          sessionId={sessionId}
          isSeated={isSeated}
        />
        <GolfActiveStack
          board={board}
          faces={faces}
          viewerId={isSeated ? viewerId : (focusId ?? viewerId)}
        />
        <GolfFooter
          slot={
            me
              ? {
                  me,
                  settings: board.settings,
                  canUse: phase === GolfPhases.Playing,
                  isLastHole: board.hole + 1 >= board.holes,
                  isSaving: stroke.isSaving,
                  onUse: playPower,
                }
              : null
          }
          status={golfStatus({ me, phase, par: hole.par })}
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
        {!isSeated && (
          <GolfWatchPicker
            faces={faces.filter((face) =>
              board.players.some((player) => player.accountId === face.accountId && !player.hasLeft)
            )}
            watch={watch}
            isFree={table.isFree}
            onFree={table.setFree}
            onRise={(sign) => table.rigRef.current.free.move.setY(sign)}
          />
        )}
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
