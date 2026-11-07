'use client'

import { useEffect } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { cuePlace, cueReady } from '@/composites/play/naval/audio/cues'
import type { NavalCaptainView } from '@/composites/play/naval/captains'
import { NavalClock } from '@/composites/play/naval/NavalClock'
import { NavalSea } from '@/composites/play/naval/NavalSea'
import { useNavalPlacement } from '@/composites/play/naval/useNavalPlacement'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { marksOf } from '@/core/lib/play/naval/sea'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY, NAVAL_MODE_COPY, NAVAL_SHIP_NAMES } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_BOARD, NAVAL_PLACE } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Placement screen: lay the fleet on the sea with taps, lock it, wait for the others
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
  const placement = useNavalPlacement(sea, board.you?.fleet ?? [], cuePlace)
  const isReady = Boolean(board.you?.isReady)
  const isPlacing = viewer >= 0 && !isReady

  // R turns the ship in hand
  const { rotate } = placement
  useEffect(() => {
    if (!isPlacing) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r') rotate()
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isPlacing, rotate])

  const lock = async () => {
    if (await act({ type: 'fleet', ships: placement.ships })) cueReady()
  }
  const ships = isReady && board.you?.fleet ? board.you.fleet : placement.ships
  const ready = captains.filter((captain) => captain.isReady || captain.isBot).length
  const left = sea.fleet.length - placement.ships.length

  return (
    <div className={NAVAL_BOARD.root}>
      <div className={NAVAL_PLACE.root}>
        <div className={NAVAL_PLACE.sea}>
          <NavalSea
            size={sea.size}
            marks={marksOf(sea.size, [])}
            ships={ships.map((ship) => ({ ship, isPicked: false }))}
            ghost={isPlacing ? placement.ghost : null}
            isOpen={isPlacing}
            isShaking={placement.isRefused}
            label={NAVAL_BOARD_COPY.yourSea}
            onPick={placement.tap}
            onHover={placement.hover}
          />
        </div>
        <div className={NAVAL_PLACE.side}>
          <div className={NAVAL_BOARD.panel}>
            <span className={NAVAL_BOARD.title}>{NAVAL_MODE_COPY[board.settings.mode].title}</span>
            <h2 className="text-xl font-black">{NAVAL_BOARD_COPY.placeTitle}</h2>
            <NavalClock
              serverTime={board.serverTime}
              endsAt={board.phaseEndsAt}
              totalSeconds={board.settings.placementSeconds + NAVAL_SETTINGS.countdownSeconds}
              alertSeconds={NAVAL_SETTINGS.alertSeconds}
            />
            {viewer < 0 && <p className={NAVAL_BOARD.sub}>{NAVAL_BOARD_COPY.spectating}</p>}
            {isPlacing && <p className={NAVAL_BOARD.sub}>{NAVAL_BOARD_COPY.placeHelp}</p>}
          </div>
          {isPlacing && (
            <div className={NAVAL_BOARD.panel}>
              <div className={NAVAL_PLACE.dock}>
                {sea.fleet.map((length, id) => {
                  const isDone = placement.ships.some((ship) => ship.id === id)

                  return (
                    <button
                      key={id}
                      type="button"
                      className={cn(
                        NAVAL_PLACE.ship,
                        placement.heldId === id && NAVAL_PLACE.shipOn,
                        isDone && placement.heldId !== id && NAVAL_PLACE.shipDone
                      )}
                      aria-pressed={placement.heldId === id}
                      onClick={() => placement.select(id)}
                    >
                      <span className={NAVAL_PLACE.cells}>
                        {Array.from({ length }, (_, cell) => (
                          <i key={cell} className={NAVAL_PLACE.cellBlock} />
                        ))}
                      </span>
                      {NAVAL_SHIP_NAMES[length]}
                    </button>
                  )
                })}
              </div>
              <p className={cn(NAVAL_BOARD.sub, 'mt-2')}>
                {left > 0
                  ? fillPlayMessage(NAVAL_BOARD_COPY.placeLeft, { count: left })
                  : NAVAL_BOARD_COPY.placeCount}
              </p>
              <div className={cn(NAVAL_PLACE.keys, 'mt-2')}>
                <button
                  type="button"
                  className={NAVAL_PLACE.key}
                  disabled={placement.heldId === null}
                  aria-pressed={!placement.isHorizontal}
                  onClick={placement.rotate}
                >
                  {NAVAL_BOARD_COPY.rotate}
                </button>
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
            <span className={NAVAL_BOARD.title}>
              {fillPlayMessage(NAVAL_BOARD_COPY.waitCount, {
                count: ready,
                total: captains.length,
              })}
            </span>
            <div className={cn(NAVAL_PLACE.ready, 'mt-2')}>
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
                  {(captain.isReady || captain.isBot) && ' ✓'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
