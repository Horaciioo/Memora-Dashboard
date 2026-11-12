'use client'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { SuspensClock } from '@/composites/play/suspens/SuspensClock'
import { SuspensGallows } from '@/composites/play/suspens/SuspensGallows'
import { SuspensKeys } from '@/composites/play/suspens/SuspensKeys'
import { SuspensResult } from '@/composites/play/suspens/SuspensResult'
import { SuspensReveal } from '@/composites/play/suspens/SuspensReveal'
import { SuspensScores } from '@/composites/play/suspens/SuspensScores'
import { SuspensWord } from '@/composites/play/suspens/SuspensWord'
import { SuspensWordForm } from '@/composites/play/suspens/SuspensWordForm'
import type { SuspensBoardView, SuspensFace } from '@/composites/play/suspens/types'
import { useLetterKeys } from '@/composites/play/suspens/useLetterKeys'
import { useSuspensSounds } from '@/composites/play/suspens/useSuspensSounds'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { fillPlayMessage, SUSPENS_BOARD_COPY, SUSPENS_SETTINGS } from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'
import { PlayGames, SuspensPhases } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

export interface SuspensBoardProps {
  sessionId: string
  board: SuspensBoardView
  // Every seat, with its face
  faces: { accountId: string; name: string; avatarUrl: string | null }[]
  viewerId: string
  isSeated: boolean
}

/**
 * Suspens screen: the gallows beside the word, the keys or the setter's field, the scores, live
 * @param {SuspensBoardProps} props - Board and table
 * @return {JSX.Element}
 */

export const SuspensBoard = ({
  sessionId,
  board: initial,
  faces,
  viewerId,
  isSeated,
}: SuspensBoardProps) => {
  const board = usePlainBoard(sessionId, initial)
  const now = useServerNow(board.serverTime)
  const { act, isSaving } = usePlayAct(sessionId)
  useSuspensSounds(board)

  const canPlay = board.isMyTurn && !board.reveal && !isSaving
  useLetterKeys(canPlay, (letter) => void act({ type: 'letter', letter }))

  const seats: SuspensFace[] = board.players.map((player) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return { ...player, name: face?.name ?? '', avatarUrl: face?.avatarUrl ?? null }
  })
  if (board.isOver) return <SuspensResult seats={seats} />

  const countdown = secondsTo(board.startsAt, now)
  const setter = seats.find((seat) => seat.accountId === board.setterId)
  const turn = seats.find((seat) => seat.accountId === board.turnId)
  const isSetter = board.setterId === viewerId
  const isPicking = board.phase === SuspensPhases.Pick
  const start = isPicking
    ? board.startsAt
    : new Date(new Date(board.turnEndsAt ?? now).getTime() - board.settings.turnSeconds * SECOND_MS)
  const lead = isPicking
    ? isSetter
      ? SUSPENS_BOARD_COPY.youPick
      : fillPlayMessage(SUSPENS_BOARD_COPY.setterPicks, { name: setter?.name ?? '' })
    : board.isMyTurn
      ? SUSPENS_BOARD_COPY.yourTurn
      : isSetter
        ? SUSPENS_BOARD_COPY.youSet
        : fillPlayMessage(SUSPENS_BOARD_COPY.theirTurn, { name: turn?.name ?? '' })

  return (
    <div className={SUSPENS_BOARD.board}>
      {board.round === 1 && countdown > 0 && (
        <PlayCountdown
          game={PlayGames.Suspens}
          seconds={countdown}
          total={SUSPENS_SETTINGS.countdownSeconds}
          figureClassName={SUSPENS_BOARD.figure}
        />
      )}

      <div className={SUSPENS_BOARD.head}>
        <span className={SUSPENS_BOARD.round}>
          {fillPlayMessage(SUSPENS_BOARD_COPY.round, { round: board.round, total: board.rounds })}
        </span>
        {board.reveal ? (
          <div className={SUSPENS_BOARD.clockTrack} />
        ) : (
          <SuspensClock
            // New turn, new bar
            key={`clock-${board.round}-${board.turnNo}-${board.phase}`}
            startsAt={start}
            endsAt={isPicking ? board.pickEndsAt : (board.turnEndsAt ?? board.pickEndsAt)}
            now={now}
          />
        )}
        <span
          className={
            board.isMyTurn || (isPicking && isSetter)
              ? SUSPENS_BOARD.leadStrong
              : SUSPENS_BOARD.lead
          }
        >
          {lead}
        </span>
      </div>

      <div className={SUSPENS_BOARD.stage}>
        <SuspensGallows errors={board.errors} allowed={board.allowed} />
        <div className={SUSPENS_BOARD.side}>
          <SuspensWord
            length={board.length}
            mask={board.mask}
            secret={board.word}
            revealed={board.reveal?.word ?? null}
          />
          {!isPicking && (
            <div className={SUSPENS_BOARD.meta}>
              <span className={SUSPENS_BOARD.count}>
                {fillPlayMessage(SUSPENS_BOARD_COPY.letters, { count: board.length })}
              </span>
              <span className={SUSPENS_BOARD.count}>
                {fillPlayMessage(SUSPENS_BOARD_COPY.errors, {
                  count: board.errors,
                  max: board.allowed,
                })}
              </span>
            </div>
          )}
          {board.wrong.length > 0 && (
            <>
              <span className={SUSPENS_BOARD.wrongLabel}>{SUSPENS_BOARD_COPY.wrong}</span>
              <div className={SUSPENS_BOARD.wrongList}>
                {board.wrong.map((letter) => (
                  <span key={letter} className={SUSPENS_BOARD.wrongLetter}>
                    {letter}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={SUSPENS_BOARD.zone}>
        {board.reveal ? (
          <SuspensReveal reveal={board.reveal} seats={seats} />
        ) : !isSeated ? (
          <p className={SUSPENS_BOARD.lead}>{SUSPENS_BOARD_COPY.watching}</p>
        ) : isPicking ? (
          isSetter &&
          countdown === 0 && (
            <div className={SUSPENS_BOARD.pick}>
              <SuspensWordForm
                sessionId={sessionId}
                type="pick"
                placeholder={SUSPENS_BOARD_COPY.pickPlaceholder}
                submit={SUSPENS_BOARD_COPY.pickSubmit}
                draw={SUSPENS_BOARD_COPY.pickDraw}
              />
              <span className={SUSPENS_BOARD.guessHint}>
                {fillPlayMessage(SUSPENS_BOARD_COPY.pickHint, { ...SUSPENS_SETTINGS.wordLength })}
              </span>
            </div>
          )
        ) : (
          <>
            <SuspensKeys
              tried={board.tried}
              wrong={board.wrong}
              isOpen={canPlay}
              onPick={(letter) => void act({ type: 'letter', letter })}
            />
            {board.isMyTurn && (
              <div className={SUSPENS_BOARD.guess}>
                <SuspensWordForm
                  sessionId={sessionId}
                  type="word"
                  placeholder={SUSPENS_BOARD_COPY.guessPlaceholder}
                  submit={SUSPENS_BOARD_COPY.guessSubmit}
                />
                <span className={SUSPENS_BOARD.guessHint}>{SUSPENS_BOARD_COPY.guessHint}</span>
              </div>
            )}
          </>
        )}
      </div>

      <SuspensScores
        seats={seats}
        setterId={board.setterId}
        turnId={board.turnId}
        isRunning={!board.reveal}
      />
    </div>
  )
}
