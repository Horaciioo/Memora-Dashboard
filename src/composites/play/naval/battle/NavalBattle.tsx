'use client'

import { useEffect, useRef, useState } from 'react'

import {
  afloatToward,
  marksToward,
  shipsShown,
  watchedMatch,
} from '@/composites/play/naval/battle/battleView'
import { callOf } from '@/composites/play/naval/battle/battleCall'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { NavalArsenal } from '@/composites/play/naval/battle/NavalArsenal'
import { NavalBracket } from '@/composites/play/naval/NavalBracket'
import { NavalFoes } from '@/composites/play/naval/battle/NavalFoes'
import { NavalHud } from '@/composites/play/naval/NavalHud'
import { NavalResult } from '@/composites/play/naval/NavalResult'
import { NavalStartCountdown } from '@/composites/play/naval/NavalStartCountdown'
import { NavalTargetSea } from '@/composites/play/naval/battle/NavalTargetSea'
import { useNavalAim } from '@/composites/play/naval/battle/useNavalAim'
import { useNavalCues } from '@/composites/play/naval/battle/useNavalCues'
import { useNavalPlayback } from '@/composites/play/naval/battle/useNavalPlayback'
import { NavalCodes } from '@/core/lib/play/naval/state'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_BOARD } from '@/declarations/ui/variants/games/naval'
import { NavalModes, NavalPhases, NavalWeapons } from '@/utils/constants/play'

/**
 * Battle screen: foes, the sea aimed at, the arsenal and the viewer's own fleet
 * @param {Object} props - Battle
 * @param {string} props.sessionId - Game
 * @param {NavalBoardState} props.board - Board
 * @param {NavalCaptainView[]} props.captains - Captains
 * @param {number} props.viewer - Seat of the viewer, minus one when watching
 * @return {JSX.Element}
 */

export const NavalBattle = ({
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
  const playback = useNavalPlayback(board, viewer)
  const [pickedMatch, setPickedMatch] = useState<number | null>(null)
  const [pickedFoe, setPickedFoe] = useState<number | null>(null)
  const matchIndex = watchedMatch(board, pickedMatch)
  const match = board.matches[matchIndex]
  const { shown, playing, event } = playback
  const fighters = match?.fighters ?? []
  const isFighter = viewer >= 0 && fighters.includes(viewer) && !captains[viewer].isOut
  const foes = fighters.filter((seat) => seat !== viewer)
  const marksOf = (seat: number) => marksToward(board, shown, matchIndex, seat)
  const afloatOf = (seat: number) => afloatToward(board, marksOf(seat), matchIndex, seat)
  const isOutShown = (seat: number) =>
    captains[seat].isOut && (afloatOf(seat) === 0 || !playback.isBusy)

  // Sea aimed at
  const alive = foes.filter((seat) => !isOutShown(seat))
  const target =
    pickedFoe !== null && foes.includes(pickedFoe) ? pickedFoe : (alive[0] ?? foes[0] ?? -1)
  const isMyTurn = match?.status === 'LIVE' && match.turn === viewer && isFighter
  const canFire = isMyTurn && !playback.isBusy && target >= 0 && !isOutShown(target)
  const aim = useNavalAim({
    sessionId,
    rev: board.rev,
    size: board.sea.size,
    target: target >= 0 ? captains[target].accountId : null,
    canFire,
    weapon: board.you?.weapon ?? NavalWeapons.Cannon,
    reachScale: board.sea.reachScale,
    resetKey: `${target}:${matchIndex}:${board.rev}`,
  })
  useNavalCues({ isMyTurn: Boolean(isMyTurn) && !playback.isBusy, event })

  // Placement may leave the page scrolled
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    root.current?.scrollIntoView({ block: 'start' })
  }, [])

  if (board.phase === NavalPhases.Over && !playback.isBusy) {
    const sunkBy = (seat: number) =>
      board.shots.filter((shot) => shot[2] === seat && shot[6] === NavalCodes.Sunk).length

    return <NavalResult captains={captains} viewer={viewer} sunkBy={sunkBy} />
  }

  const { call, tone } = callOf({ board, match: matchIndex, viewer, captains, playback })
  // Attacked or waiting for the turn: the viewer's own sea, else the sea aimed at
  const isIncoming = playing?.strike.match === matchIndex && playing.strike.target === viewer
  const isOwnShown =
    isFighter && match?.status === 'LIVE' && (isIncoming || (!isMyTurn && !playing))
  const mineMarks = viewer >= 0 ? marksOf(viewer) : []
  const mineWrecks = isOwnShown ? shipsShown(board, mineMarks, matchIndex, viewer) : []
  const onTarget =
    playing && playing.strike.match === matchIndex && playing.strike.target === target
      ? playing
      : null
  const chips = foes.map((seat) => ({
    captain: captains[seat],
    afloat: afloatOf(seat),
    isOut: isOutShown(seat),
    isTurn: match?.turn === seat && match.status === 'LIVE',
    isHit: false,
  }))
  const clock =
    match?.status === 'LIVE'
      ? {
          serverTime: board.serverTime,
          endsAt: match.turnEndsAt,
          totalSeconds: board.settings.turnSeconds + NAVAL_SETTINGS.graceSeconds,
          alertSeconds: NAVAL_SETTINGS.alertSeconds,
        }
      : null

  return (
    <div ref={root} className={NAVAL_BOARD.root}>
      {match && <NavalStartCountdown startsAt={match.startsAt} serverTime={board.serverTime} map={board.settings.map} />}
      <div className={NAVAL_BOARD.battle}>
        <div className={NAVAL_BOARD.stage}>
          <NavalHud call={call} tone={tone} clock={clock} />
          {target >= 0 && (
            <NavalTargetSea
              size={board.sea.size}
              map={board.settings.map}
              target={captains[isOwnShown ? viewer : target]}
              isMine={isOwnShown}
              marks={isOwnShown ? mineMarks : marksOf(target)}
              ships={
                isOwnShown
                  ? (board.you?.fleet ?? []).map((ship) => ({
                      ship,
                      isWreck: mineWrecks.some((entry) => entry.ship.id === ship.id),
                    }))
                  : shipsShown(board, marksOf(target), matchIndex, target)
              }
              playing={isOwnShown ? (isIncoming ? playing : null) : onTarget}
              aim={aim}
              callout={
                event && event.strike.match === matchIndex ? { event, captains, viewer } : null
              }
            />
          )}
          {isFighter && (
            <NavalArsenal
              weapon={aim.weapon}
              drawKey={String(board.rev)}
              orientation={aim.orientation}
              isMyTurn={Boolean(isMyTurn)}
              canFire={aim.isOpen && Boolean(aim.aim)}
              waitCall={call}
              onTurn={aim.turn}
              onFire={aim.fire}
            />
          )}
        </div>
        <div className={NAVAL_BOARD.rail}>
          {foes.length > 1 && (
            <NavalFoes
              chips={chips}
              total={board.sea.fleet.length}
              selected={target}
              canPick
              onPick={setPickedFoe}
            />
          )}
          {board.settings.mode === NavalModes.Bracket && (
            <NavalBracket
              board={board}
              captains={captains}
              watched={matchIndex}
              viewer={viewer}
              onWatch={setPickedMatch}
            />
          )}
        </div>
      </div>
    </div>
  )
}
