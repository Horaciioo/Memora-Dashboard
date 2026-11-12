'use client'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { EchoCard } from '@/composites/play/echo/EchoCard'
import { EchoClock } from '@/composites/play/echo/EchoClock'
import { EchoHands } from '@/composites/play/echo/EchoHands'
import { EchoResult } from '@/composites/play/echo/EchoResult'
import { EchoReveal } from '@/composites/play/echo/EchoReveal'
import { EchoScores } from '@/composites/play/echo/EchoScores'
import type { EchoBoardView, EchoFace } from '@/composites/play/echo/types'
import { useEchoSounds } from '@/composites/play/echo/useEchoSounds'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { ECHO_BOARD_COPY, ECHO_SETTINGS, fillPlayMessage } from '@/declarations/play'
import { ECHO_BOARD } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

export interface EchoBoardProps {
  sessionId: string
  board: EchoBoardView
  // Every seat, with its face
  faces: { accountId: string; name: string; avatarUrl: string | null }[]
  viewerId: string
  isSeated: boolean
}

/**
 * Echo screen: the center card, the own card, the other hands and the scores, live
 * @param {EchoBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const EchoBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: EchoBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const now = useServerNow(board.serverTime)
  const { act } = usePlayAct(sessionId)
  useEchoSounds(board, viewerId)

  const seats: EchoFace[] = board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return { ...player, name: face?.name ?? '', avatarUrl: face?.avatarUrl ?? null }
  })
  if (board.isOver) return <EchoResult seats={seats} />

  const countdown = secondsTo(board.startsAt, now)
  const me = seats.find((seat) => seat.accountId === viewerId)
  const hand = board.hands.find((entry) => entry.accountId === viewerId)
  const isReveal = board.revealUntil !== null
  const isLocked = new Date(me?.lockedUntil ?? 0).getTime() > now
  const canPick = isSeated && countdown === 0 && !isReveal && !me?.rank

  return (
    <div className={ECHO_BOARD.board}>
      {board.round === 1 && countdown > 0 && (
        <PlayCountdown
          game={PlayGames.Echo}
          seconds={countdown}
          total={ECHO_SETTINGS.countdownSeconds}
          figureClassName={ECHO_BOARD.figure}
        />
      )}

      <div className={ECHO_BOARD.head}>
        <span className={ECHO_BOARD.round}>
          {fillPlayMessage(ECHO_BOARD_COPY.round, { round: board.round, total: board.rounds })}
        </span>
        {isReveal ? (
          <div className={ECHO_BOARD.clockTrack} />
        ) : (
          // New round, new bar
          <EchoClock key={board.round} startsAt={board.startsAt} endsAt={board.endsAt} now={now} />
        )}
      </div>

      <div className={ECHO_BOARD.table}>
        <figure className={ECHO_BOARD.slot}>
          <EchoCard
            key={`c${board.round}`}
            card={board.center}
            seed={board.seed}
            answer={isReveal ? hand?.answer : null}
          />
          <figcaption className={ECHO_BOARD.caption}>{ECHO_BOARD_COPY.center}</figcaption>
        </figure>
        {hand && (
          <figure className={ECHO_BOARD.slot}>
            <EchoCard
              key={`m${board.round}`}
              card={hand.card}
              seed={board.seed + 1}
              answer={hand.answer}
              isLocked={isLocked}
              onPick={canPick ? (symbol) => void act({ type: 'pick', symbol }) : undefined}
            />
            <figcaption className={ECHO_BOARD.caption}>
              {isLocked ? ECHO_BOARD_COPY.locked : ECHO_BOARD_COPY.mine}
            </figcaption>
          </figure>
        )}
      </div>

      {isReveal && isSeated && <EchoReveal answer={hand?.answer ?? null} me={me} />}
      {!isSeated && <p className={ECHO_BOARD.lead}>{ECHO_BOARD_COPY.watching}</p>}
      {isSeated && !isReveal && <p className={ECHO_BOARD.lead}>{ECHO_BOARD_COPY.lead}</p>}

      <EchoHands hands={board.hands} seats={seats} seed={board.seed} viewerId={viewerId} />
      <EchoScores seats={seats} round={board.round} />
    </div>
  )
}
