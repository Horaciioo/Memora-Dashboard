'use client'

import { useCallback, useMemo, useRef } from 'react'

import { StopGoDock } from '@/composites/play/stopgo/cards/StopGoDock'
import { StopGoFlights } from '@/composites/play/stopgo/fx/StopGoFlights'
import { useStopGoFx } from '@/composites/play/stopgo/fx/useStopGoFx'
import { StopGoResult } from '@/composites/play/stopgo/result/StopGoResult'
import { StopGoHud } from '@/composites/play/stopgo/hud/StopGoHud'
import { StopGoCar } from '@/composites/play/stopgo/board/StopGoCar'
import { StopGoMeadow } from '@/composites/play/stopgo/board/StopGoMeadow'
import { StopGoDecor } from '@/composites/play/stopgo/board/StopGoDecor'
import { StopGoSigns } from '@/composites/play/stopgo/board/StopGoSigns'
import { StopGoProgress } from '@/composites/play/stopgo/board/StopGoProgress'
import { StopGoTrack } from '@/composites/play/stopgo/board/StopGoTrack'
import { useTrackCamera } from '@/composites/play/stopgo/board/useTrackCamera'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { pointAt, trackOf } from '@/core/lib/play/stopgo'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_TRACK } from '@/declarations/play/stopgo/track'
import { PlayGames, StopGoPhases } from '@/utils/constants/play'
import { usePlayPref } from '@/core/store/play/playPrefs'

export interface StopGoBoardProps {
  sessionId: string
  // Board of the page render, the live one follows
  board: StopGoBoardView
  faces: PlayFace[]
  viewerId: string
  isSeated: boolean
}

// Maps kept in the page around the one in view
const NEIGHBOURS = 1

/**
 * Track of a race with every car, only the maps near the view are in the page
 * @param {StopGoBoardProps} props - Board
 * @return {JSX.Element}
 */

export const StopGoBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: StopGoBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const isMobile = useIsMobileShell()
  const hasFlights = usePlayPref(PlayGames.StopGo, 'flights')
  const { flights, marks, land } = useStopGoFx(board, hasFlights)
  const { players, target } = board
  const lanes = players.length
  const plan = useMemo(() => trackOf(target, lanes), [target, lanes])
  // Same arrays between two boards so the road and the signs are not drawn again
  const slotKey = players.map(({ slot }) => slot).join()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colors = useMemo(
    () =>
      players.map(
        ({ slot }) => STOPGO_SETTINGS.colors[slot % STOPGO_SETTINGS.colors.length] as StopGoCarColor
      ),
    [slotKey]
  )
  const mine = players.find(({ accountId }) => accountId === viewerId)
  // The camera rides the car on turn, the own one while nobody plays
  const holder = players.find(({ accountId }) => accountId === board.turnId) ?? mine
  const focusKm = holder?.km ?? Math.max(...players.map(({ km }) => km))
  const focusMap = Math.min(plan.maps.length - 1, Math.floor(focusKm / STOPGO_SETTINGS.mapKm))
  // Road and signs are cheap, scenery only near the car
  const allMaps = useMemo(() => plan.maps.map((_, index) => index), [plan])
  const maps = allMaps.filter((index) => Math.abs(index - focusMap) <= NEIGHBOURS)
  const scroller = useRef<HTMLDivElement>(null)
  const drawing = useRef<SVGSVGElement>(null)
  const height = plan.mapHeight * plan.maps.length + 2 * STOPGO_TRACK.capHeight

  const viewTop = -plan.mapHeight * plan.maps.length - STOPGO_TRACK.capHeight

  const getFocusTop = useCallback(() => {
    const box = scroller.current
    if (!box) return 0
    const { y } = pointAt(plan, focusKm, 0)
    // The phone dock covers the foot of the track, the camera centres on what stays visible
    const covered = isMobile ? Number.parseFloat(getComputedStyle(box).paddingBottom) || 0 : 0

    const { focusShare, phoneFocusShare } = STOPGO_TRACK.camera

    return (
      ((y - viewTop) * (drawing.current?.clientWidth ?? box.clientWidth)) / plan.width -
      (box.clientHeight - covered) * (isMobile ? phoneFocusShare : focusShare)
    )
  }, [plan, focusKm, viewTop, isMobile])

  useTrackCamera({
    scroller,
    getFocusTop,
    followKey: `${focusKm}:${board.turnNo}`,
    turnKey: board.turnNo,
    isActive: true,
  })

  if (board.phase === StopGoPhases.Over) return <StopGoResult board={board} faces={faces} />

  return (
    <div className="relative size-full">
      <div
        ref={scroller}
        className="stopgo-ground size-full touch-pan-y [scrollbar-width:none] overflow-x-hidden overflow-y-auto overscroll-contain max-md:pb-[var(--stopgo-dock-h,10rem)]"
      >
        <svg
          ref={drawing}
          style={{ width: `min(100%, ${plan.width * STOPGO_TRACK.zoom}px)` }}
          viewBox={`${plan.minX} ${viewTop} ${plan.width} ${height}`}
          className="mx-auto block"
          role="img"
        >
          <defs>
            <pattern id="stopgo-checker" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" style={{ fill: 'var(--stopgo-kerb-white)' }} />
              <rect width="14" height="14" style={{ fill: 'var(--stopgo-asphalt-deep)' }} />
              <rect
                x="14"
                y="14"
                width="14"
                height="14"
                style={{ fill: 'var(--stopgo-asphalt-deep)' }}
              />
            </pattern>
          </defs>
          {maps.map((map) => (
            <StopGoMeadow key={`meadow-${map}`} plan={plan} seed={sessionId} map={map} />
          ))}
          {maps.map((map) => (
            <StopGoDecor key={map} plan={plan} seed={sessionId} map={map} />
          ))}
          <StopGoTrack plan={plan} maps={allMaps} colors={colors} />
          <StopGoSigns plan={plan} maps={allMaps} />
          {players.map((player, lane) => {
            const face = faces.find(({ id }) => id === player.accountId)

            return (
              <StopGoCar
                key={player.accountId}
                accountId={player.accountId}
                plan={plan}
                lane={lane}
                km={player.km}
                color={colors[lane]}
                name={face?.name ?? ''}
                avatarUrl={face?.avatarUrl ?? null}
                hasLeft={player.hasLeft}
                mark={marks[player.accountId]}
              />
            )
          })}
        </svg>
      </div>
      <StopGoDock
        sessionId={sessionId}
        board={board}
        viewerId={viewerId}
        names={Object.fromEntries(faces.map(({ id, name }) => [id, name]))}
        avatars={Object.fromEntries(faces.map(({ id, avatarUrl }) => [id, avatarUrl]))}
        colors={colors}
      />
      <StopGoHud
        sessionId={sessionId}
        board={board}
        faces={faces}
        viewerId={viewerId}
        isSeated={isSeated}
      />
      {hasFlights && <StopGoFlights flights={flights} viewerId={viewerId} onLand={land} />}
      <StopGoProgress
        scroller={scroller}
        plan={plan}
        viewTop={viewTop}
        viewHeight={height}
        cars={players.map(({ accountId, km }, lane) => ({
          id: accountId,
          km,
          color: colors[lane],
        }))}
      />
    </div>
  )
}
