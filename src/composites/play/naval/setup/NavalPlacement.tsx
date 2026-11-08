'use client'

import { useEffect, useRef } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { NavalClock } from '@/composites/play/naval/NavalClock'
import { NavalDock } from '@/composites/play/naval/NavalDock'
import { NavalSkinPicker } from '@/composites/play/naval/setup/NavalSkinPicker'
import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import { useOceanCamera } from '@/composites/play/naval/ocean/useOceanCamera'
import { playNaval } from '@/composites/play/naval/sound'
import { useNavalPlacement } from '@/composites/play/naval/setup/useNavalPlacement'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { marksOf } from '@/core/lib/play/naval/sea'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { NAVAL_BOARD_COPY, NAVAL_MODE_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_BOARD, NAVAL_PLACE } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Placement screen: drag the fleet onto the sea, lock it, wait for the others
 * @param {Object} props - Placement
 * @param {string} props.sessionId - Game
 * @param {NavalBoardState} props.board - Board
 * @param {NavalCaptainView[]} props.captains - Captains
 * @param {number} props.viewer - Seat of the viewer, minus one when watching
 * @return {JSX.Element}
 */

export const NavalPlacement = ({
  sessionId,
  board,
  captains,
  viewer,
}: {
  sessionId: string
  board: NavalBoardState
  captains: NavalCaptainView[]
  viewer: number
}) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const sea = { ...board.sea, isSpaced: board.settings.rules.spacedShips }
  const placement = useNavalPlacement(sea, board.you?.fleet ?? [])
  const [camera, setCamera] = useOceanCamera(sea.size, 'placement', sea.size)
  const box = useRef<HTMLDivElement>(null)
  const isReady = Boolean(board.you?.isReady)
  const isPlacing = viewer >= 0 && !isReady

  // R turns the ship in hand
  const { rotate } = placement
  useEffect(() => {
    if (!isPlacing) return
    const onKey = (event: KeyboardEvent) => event.key.toLowerCase() === 'r' && rotate()
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isPlacing, rotate])

  const lock = async () => {
    if (await act({ type: 'fleet', ships: placement.ships })) playNaval('bell', 0.6)
  }
  const ships = isReady && board.you?.fleet ? board.you.fleet : placement.ships
  const ready = captains.filter((captain) => captain.isReady || captain.isBot).length

  return (
    <div className={NAVAL_BOARD.root}>
      <div className={NAVAL_PLACE.root}>
        <div className={NAVAL_PLACE.sea}>
          <NavalOcean
            boxRef={box}
            size={sea.size}
            camera={camera}
            setCamera={setCamera}
            marks={marksOf(sea.size, [])}
            ships={ships.map((ship) => ({ ship }))}
            zone={isPlacing ? placement.zone : null}
            label={NAVAL_BOARD_COPY.yourSea}
            {...(isPlacing && {
              onGrab: placement.onGrab,
              onDrag: placement.onDrag,
              onDrop: placement.onDrop,
            })}
          />
        </div>
        <div className={NAVAL_PLACE.side}>
          <div className={NAVAL_BOARD.panel}>
            <span className={NAVAL_BOARD.title}>{NAVAL_MODE_COPY[board.settings.mode].title}</span>
            <h2 className={NAVAL_PLACE.heading}>{NAVAL_BOARD_COPY.placeTitle}</h2>
            <NavalClock
              serverTime={board.serverTime}
              endsAt={board.phaseEndsAt}
              totalSeconds={board.settings.placementSeconds + NAVAL_SETTINGS.countdownSeconds}
              alertSeconds={NAVAL_SETTINGS.alertSeconds}
            />
            {viewer < 0 && <p className={NAVAL_BOARD.sub}>{NAVAL_BOARD_COPY.spectating}</p>}
          </div>
          {isPlacing && (
            <div className={NAVAL_BOARD.panel}>
              <NavalDock
                fleet={sea.fleet}
                placed={placement.ships.map((ship) => ship.id)}
                heldId={placement.heldId}
                box={box}
                view={{ camera, size: sea.size }}
                onGrab={placement.grabFromDock}
                onDrag={placement.onDrag}
                onDrop={placement.onDrop}
              />
              <div className={cn(NAVAL_PLACE.keys, 'mt-2')}>
                <button type="button" className={NAVAL_PLACE.key} onClick={placement.shuffle}>
                  {NAVAL_BOARD_COPY.random}
                </button>
                <button type="button" className={NAVAL_PLACE.key} onClick={placement.clear}>
                  {NAVAL_BOARD_COPY.clear}
                </button>
                <button
                  type="button"
                  className={NAVAL_PLACE.keyMain}
                  disabled={!placement.isComplete || isSaving}
                  onClick={() => void lock()}
                >
                  {NAVAL_BOARD_COPY.validate}
                </button>
              </div>
            </div>
          )}
          {isReady && (
            <div className={NAVAL_BOARD.panel}>
              <p className={NAVAL_BOARD.sub}>{NAVAL_BOARD_COPY.waitOthers}</p>
              <button
                type="button"
                className={cn(NAVAL_PLACE.key, 'mt-2')}
                disabled={isSaving}
                onClick={() => void act({ type: 'unready' })}
              >
                {NAVAL_BOARD_COPY.edit}
              </button>
            </div>
          )}
          <div className={NAVAL_BOARD.panel}>
            <span className={NAVAL_BOARD.title}>{NAVAL_BOARD_COPY.skin}</span>
            <NavalSkinPicker />
          </div>
          <div className={cn(NAVAL_BOARD.panel, NAVAL_PLACE.roster)}>
            <div className={NAVAL_PLACE.ready}>
              {captains.map((captain) => (
                <span
                  key={captain.accountId}
                  className={cn(
                    NAVAL_PLACE.readyRow,
                    !(captain.isReady || captain.isBot) && NAVAL_PLACE.readyOff
                  )}
                >
                  <Avatar name={captain.name} src={captain.avatarUrl} size="xs" />
                  {captain.name}
                </span>
              ))}
            </div>
            <span className="sr-only">{`${ready}/${captains.length}`}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
