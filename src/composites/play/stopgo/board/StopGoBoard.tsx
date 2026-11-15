'use client'

import { useEffect, useMemo, useRef } from 'react'

import { StopGoCar } from '@/composites/play/stopgo/board/StopGoCar'
import { StopGoDecor } from '@/composites/play/stopgo/board/StopGoDecor'
import { StopGoSigns } from '@/composites/play/stopgo/board/StopGoSigns'
import { StopGoTrack } from '@/composites/play/stopgo/board/StopGoTrack'
import { pointAt, trackOf } from '@/core/lib/play/stopgo'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_TRACK } from '@/declarations/play/stopgo/track'

export interface StopGoBoardProps {
  sessionId: string
  board: StopGoBoardView
  faces: PlayFace[]
  viewerId: string
}

// Maps kept in the page around the one in view
const NEIGHBOURS = 1

/**
 * Track of a race with every car, only the maps near the view are in the page
 * @param {StopGoBoardProps} props - Board
 * @return {JSX.Element}
 */

export const StopGoBoard = ({ sessionId, board, faces, viewerId }: StopGoBoardProps) => {
  const { players, target } = board
  const lanes = players.length
  const plan = useMemo(() => trackOf(target, lanes), [target, lanes])
  const colors = players.map(
    ({ slot }) => STOPGO_SETTINGS.colors[slot % STOPGO_SETTINGS.colors.length] as StopGoCarColor
  )
  const mine = players.find(({ accountId }) => accountId === viewerId)
  const focusKm = mine?.km ?? Math.max(...players.map(({ km }) => km))
  const focusMap = Math.min(plan.maps.length - 1, Math.floor(focusKm / STOPGO_SETTINGS.mapKm))
  const maps = plan.maps
    .map((_, index) => index)
    .filter((index) => Math.abs(index - focusMap) <= NEIGHBOURS)
  const scroller = useRef<HTMLDivElement>(null)
  const height = plan.mapHeight * plan.maps.length + 2 * STOPGO_TRACK.capHeight

  useEffect(() => {
    const box = scroller.current
    if (!box) return
    const { y } = pointAt(plan, focusKm, 0)
    const ratio = box.clientWidth / plan.width
    box.scrollTop =
      (y + plan.mapHeight * plan.maps.length + STOPGO_TRACK.capHeight) * ratio -
      box.clientHeight / 2
  }, [plan, focusMap]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={scroller} className="size-full overflow-x-hidden overflow-y-auto">
      <svg
        viewBox={`${plan.minX} ${-plan.mapHeight * plan.maps.length - STOPGO_TRACK.capHeight} ${plan.width} ${height}`}
        className="block w-full"
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
          <StopGoDecor key={map} plan={plan} seed={sessionId} map={map} />
        ))}
        <StopGoTrack plan={plan} maps={maps} colors={colors} />
        <StopGoSigns plan={plan} maps={maps} />
        {players.map((player, lane) => {
          const face = faces.find(({ id }) => id === player.accountId)

          return (
            <StopGoCar
              key={player.accountId}
              plan={plan}
              lane={lane}
              km={player.km}
              color={colors[lane]}
              name={face?.name ?? ''}
              avatarUrl={face?.avatarUrl ?? null}
              hasLeft={player.hasLeft}
            />
          )
        })}
      </svg>
    </div>
  )
}
