'use client'

import { useEffect, useRef } from 'react'

import { NavalHud } from '@/composites/play/naval/NavalHud'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import { playNaval } from '@/composites/play/naval/sound'
import { useNavalPlacement } from '@/composites/play/naval/setup/useNavalPlacement'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { marksOf } from '@/core/lib/play/naval/sea'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_HUD, NAVAL_PLACE } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'

/**
 * Placement screen: drag the fleet onto the sea, lock it, wait for the others
 * @param {Object} props - Placement
 * @param {string} props.sessionId - Game
 * @param {NavalBoardState} props.board - Board
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

  return (
    <div className={NAVAL_PLACE.root}>
      <NavalHud
        sessionId={sessionId}
        board={board}
        captains={captains}
        viewer={viewer}
        call={
          viewer < 0
            ? NAVAL_BOARD_COPY.spectating
            : isReady
              ? NAVAL_BOARD_COPY.waitOthers
              : NAVAL_BOARD_COPY.placeTitle
        }
        tone="calm"
        clock={{
          serverTime: board.serverTime,
          endsAt: board.phaseEndsAt,
          totalSeconds: board.settings.placementSeconds + NAVAL_SETTINGS.countdownSeconds,
          alertSeconds: NAVAL_SETTINGS.alertSeconds,
        }}
        actions={
          viewer >= 0 && (
            <>
              {isPlacing ? (
                <>
                  <button type="button" className={NAVAL_HUD.action} onClick={placement.shuffle}>
                    {NAVAL_BOARD_COPY.random}
                  </button>
                  <button
                    type="button"
                    className={cn(NAVAL_HUD.action, NAVAL_HUD.actionMain)}
                    disabled={!placement.isComplete || isSaving}
                    onClick={() => void lock()}
                  >
                    {NAVAL_BOARD_COPY.validate}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={NAVAL_HUD.action}
                  disabled={isSaving}
                  onClick={() => void act({ type: 'unready' })}
                >
                  {NAVAL_BOARD_COPY.edit}
                </button>
              )}
            </>
          )
        }
      />
      <div className={NAVAL_PLACE.stage}>
        <div className={NAVAL_PLACE.body}>
          <div className={NAVAL_PLACE.sea}>
            <NavalOcean
              boxRef={box}
              size={sea.size}
              map={board.settings.map}
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
        </div>
      </div>
    </div>
  )
}
