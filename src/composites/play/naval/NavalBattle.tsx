'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import {
  afloatToward,
  marksToward,
  shipsShown,
  watchedMatch,
} from '@/composites/play/naval/battleView'
import { calloutOf, callOf } from '@/composites/play/naval/battleCall'
import type { NavalCaptainView } from '@/composites/play/naval/captains'
import { NavalBracket } from '@/composites/play/naval/NavalBracket'
import { NavalEffects } from '@/composites/play/naval/NavalEffects'
import { NavalFireBar } from '@/composites/play/naval/NavalFireBar'
import { NavalFoes } from '@/composites/play/naval/NavalFoes'
import { NavalHud } from '@/composites/play/naval/NavalHud'
import { NavalMine } from '@/composites/play/naval/NavalMine'
import { NavalResult } from '@/composites/play/naval/NavalResult'
import { NavalSea } from '@/composites/play/naval/NavalSea'
import { NavalSide } from '@/composites/play/naval/NavalSide'
import { NavalStartCountdown } from '@/composites/play/naval/NavalStartCountdown'
import { useNavalCues } from '@/composites/play/naval/useNavalCues'
import { useNavalFiring } from '@/composites/play/naval/useNavalFiring'
import { useNavalPlayback } from '@/composites/play/naval/useNavalPlayback'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY, NAVAL_MODE_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_BOARD, NAVAL_CALLOUT } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'
import { NavalModes, NavalPhases } from '@/utils/constants/play'

/**
 * Battle screen: foes, the sea aimed at, the fire key and the viewer's own fleet
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
  const targetMarks = target >= 0 ? marksOf(target) : []
  const isMyTurn = match?.status === 'LIVE' && match.turn === viewer
  const canFire = isMyTurn && !playback.isBusy && target >= 0 && !isOutShown(target)
  const firing = useNavalFiring(sessionId, board.rev, `${target}:${matchIndex}`)

  // Danger and sound
  const mineMarks = viewer >= 0 ? marksOf(viewer) : []
  const mineAfloat = viewer >= 0 ? afloatOf(viewer) : 0
  const total = board.sea.fleet.length
  const isEnemyAiming =
    viewer >= 0 && match?.status === 'LIVE' && !isMyTurn && !captains[viewer]?.isOut
  useNavalCues({
    isMyTurn: Boolean(isMyTurn) && !playback.isBusy,
    tension: isEnemyAiming ? Math.max(0.25, 1 - mineAfloat / total) : 0,
    event,
  })

  if (board.phase === NavalPhases.Over && !playback.isBusy) {
    const sunkBy = (seat: number) =>
      board.shots.filter((shot) => shot[2] === seat && shot[6] === 2).length

    return <NavalResult captains={captains} viewer={viewer} sunkBy={sunkBy} />
  }

  const { call, tone } = callOf({ board, match: matchIndex, viewer, captains, playback })
  const hit = playing?.shot
  const isOnTarget = Boolean(hit && hit.match === matchIndex && hit.target === target)
  const chips = (viewer >= 0 && !foes.length ? [] : foes).map((seat) => ({
    captain: captains[seat],
    afloat: afloatOf(seat),
    isOut: isOutShown(seat),
    isTurn: match?.turn === seat && match.status === 'LIVE',
    isHit: hit?.target === seat && playing?.stage === 'impact' && hit.code > 0,
  }))
  const calloutText =
    event && event.shot.match === matchIndex ? calloutOf(event, captains, viewer) : null

  return (
    <div className={NAVAL_BOARD.root}>
      {match && <NavalStartCountdown startsAt={match.startsAt} serverTime={board.serverTime} />}
      {playing?.stage === 'flight' && playing.shot.target === viewer && (
        <div
          key={playing.shot.rev}
          className="naval-danger"
          style={{ '--flight': `${NAVAL_SETTINGS.flightMs}ms` } as CSSProperties}
        />
      )}
      <div className={NAVAL_BOARD.battle}>
        <div className={NAVAL_BOARD.hud}>
          <NavalHud
            mode={NAVAL_MODE_COPY[board.settings.mode].title}
            call={call}
            tone={tone}
            clock={
              match?.status === 'LIVE'
                ? {
                    serverTime: board.serverTime,
                    endsAt: match.turnEndsAt,
                    totalSeconds: board.settings.turnSeconds + NAVAL_SETTINGS.graceSeconds,
                    alertSeconds: NAVAL_SETTINGS.alertSeconds,
                  }
                : null
            }
          />
        </div>
        <div className={NAVAL_BOARD.left}>
          {chips.length > 0 && (
            <div className={NAVAL_BOARD.foes}>
              <NavalFoes
                chips={chips}
                total={total}
                selected={target}
                canPick={foes.length > 1}
                onPick={setPickedFoe}
              />
            </div>
          )}
          {viewer >= 0 && board.you?.fleet && (
            <div className={NAVAL_BOARD.mine}>
              <NavalMine
                size={board.sea.size}
                marks={mineMarks}
                ships={[
                  ...board.you.fleet.map((ship) => ({
                    ship,
                    isWreck: shipsShown(board, mineMarks, matchIndex, viewer).some(
                      (entry) => entry.ship.id === ship.id
                    ),
                  })),
                ]}
                playing={playing && playing.shot.target === viewer ? playing : null}
                afloat={mineAfloat}
              />
            </div>
          )}
        </div>
        <div className={NAVAL_BOARD.sea}>
          {target >= 0 && (
            <div className="relative">
              <NavalSea
                size={board.sea.size}
                marks={targetMarks}
                ships={shipsShown(board, targetMarks, matchIndex, target)}
                aim={canFire ? firing.aim : null}
                fresh={shown
                  .filter((shot) => shot.match === matchIndex && shot.target === target)
                  .at(-1)}
                isOpen={canFire}
                isLive
                isShaking={isOnTarget && playing?.stage === 'impact' && (hit?.code ?? 0) > 0}
                label={fillPlayMessage(NAVAL_BOARD_COPY.seaOf, { name: captains[target].name })}
                squareLabel={(name) => name}
                onPick={(x, y) => canFire && firing.pick(x, y)}
                effects={isOnTarget && playing ? <NavalEffects playing={playing} /> : null}
              />
              {calloutText && (
                <div key={event?.id} className={NAVAL_CALLOUT.root}>
                  <span className={cn(NAVAL_CALLOUT.text, NAVAL_CALLOUT[calloutText.tone])}>
                    {calloutText.text}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {isFighter && (
          <div className={NAVAL_BOARD.fire}>
            <NavalFireBar
              aim={firing.aim}
              canFire={canFire}
              isSending={firing.isSending}
              hint={canFire ? NAVAL_BOARD_COPY.tapToAim : call}
              onFire={() => void firing.fire(captains[target].accountId)}
            />
          </div>
        )}
        <div className={NAVAL_BOARD.side}>
          {board.settings.mode === NavalModes.Bracket ? (
            <NavalBracket
              board={board}
              captains={captains}
              watched={matchIndex}
              viewer={viewer}
              onWatch={setPickedMatch}
            />
          ) : null}
          <NavalSide captains={captains} shown={shown} match={matchIndex} afloatOf={afloatOf} />
        </div>
      </div>
    </div>
  )
}
