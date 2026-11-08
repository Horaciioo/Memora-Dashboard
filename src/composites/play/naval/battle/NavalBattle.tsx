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
import { NavalMine } from '@/composites/play/naval/battle/NavalMine'
import { NavalResult } from '@/composites/play/naval/NavalResult'
import { NavalSide } from '@/composites/play/naval/battle/NavalSide'
import { NavalStartCountdown } from '@/composites/play/naval/NavalStartCountdown'
import { NavalTargetSea } from '@/composites/play/naval/battle/NavalTargetSea'
import { useNavalAim } from '@/composites/play/naval/battle/useNavalAim'
import { useNavalCues } from '@/composites/play/naval/battle/useNavalCues'
import { useNavalPlayback } from '@/composites/play/naval/battle/useNavalPlayback'
import { NavalCodes } from '@/core/lib/play/naval/state'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { NAVAL_MODE_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_BOARD } from '@/declarations/ui/variants/naval'
import { NavalModes, NavalPhases } from '@/utils/constants/play'

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
    arms: { ammo: board.you?.ammo ?? 0, offer: board.you?.offer ?? [] },
    resetKey: `${target}:${matchIndex}:${board.rev}`,
  })
  useNavalCues({ isMyTurn: Boolean(isMyTurn) && !playback.isBusy, event })

  // Placement may leave the page scrolled
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => root.current?.scrollIntoView({ block: 'start' }), [])

  if (board.phase === NavalPhases.Over && !playback.isBusy) {
    const sunkBy = (seat: number) =>
      board.shots.filter((shot) => shot[2] === seat && shot[6] === NavalCodes.Sunk).length

    return <NavalResult captains={captains} viewer={viewer} sunkBy={sunkBy} />
  }

  const { call, tone } = callOf({ board, match: matchIndex, viewer, captains, playback })
  const onTarget =
    playing && playing.strike.match === matchIndex && playing.strike.target === target
      ? playing
      : null
  const mineMarks = viewer >= 0 ? marksOf(viewer) : []
  const wrecks = viewer >= 0 ? shipsShown(board, mineMarks, matchIndex, viewer) : []
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
      {match && <NavalStartCountdown startsAt={match.startsAt} serverTime={board.serverTime} />}
      <div className={NAVAL_BOARD.battle}>
        <div className={NAVAL_BOARD.hud}>
          <NavalHud
            mode={NAVAL_MODE_COPY[board.settings.mode].title}
            call={call}
            tone={tone}
            clock={clock}
          />
        </div>
        <div className={NAVAL_BOARD.left}>
          {foes.length > 1 && (
            <div className={NAVAL_BOARD.foes}>
              <NavalFoes
                chips={chips}
                total={board.sea.fleet.length}
                selected={target}
                canPick
                onPick={setPickedFoe}
              />
            </div>
          )}
          {viewer >= 0 && board.you?.fleet && (
            <div className={NAVAL_BOARD.mine}>
              <NavalMine
                size={board.sea.size}
                marks={mineMarks}
                ships={board.you.fleet.map((ship) => ({
                  ship,
                  isWreck: wrecks.some((entry) => entry.ship.id === ship.id),
                }))}
                playing={playing && playing.strike.target === viewer ? playing : null}
              />
            </div>
          )}
        </div>
        <div className={NAVAL_BOARD.sea}>
          {target >= 0 && (
            <NavalTargetSea
              size={board.sea.size}
              seaKey={`${matchIndex}:${target}`}
              target={captains[target]}
              marks={marksOf(target)}
              ships={shipsShown(board, marksOf(target), matchIndex, target)}
              playing={onTarget}
              aim={aim}
              callout={
                event && event.strike.match === matchIndex ? { event, captains, viewer } : null
              }
            />
          )}
        </div>
        {isFighter && (
          <div className={NAVAL_BOARD.fire}>
            <NavalArsenal
              weapon={aim.weapon}
              orientation={aim.orientation}
              arms={{ ammo: board.you?.ammo ?? 0, offer: board.you?.offer ?? [] }}
              isMyTurn={Boolean(isMyTurn)}
              canFire={aim.isOpen && Boolean(aim.aim)}
              waitCall={call}
              onPick={aim.pick}
              onTurn={aim.turn}
              onFire={aim.fire}
            />
          </div>
        )}
        <div className={NAVAL_BOARD.side}>
          {board.settings.mode === NavalModes.Bracket && (
            <NavalBracket
              board={board}
              captains={captains}
              watched={matchIndex}
              viewer={viewer}
              onWatch={setPickedMatch}
            />
          )}
          {board.settings.mode === NavalModes.Melee && (
            <NavalSide captains={captains} afloatOf={afloatOf} />
          )}
        </div>
      </div>
    </div>
  )
}
