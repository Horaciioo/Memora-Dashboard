'use client'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { usePlayInvites } from '@/core/hooks/data/play/usePlayInvites'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { usePlayNoticeStore } from '@/core/store/play/playNotices'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { BUTTON_STYLES, PLAY_END } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Replay of a finished game and who answered it
 * @typedef {Object} PlayRematchState
 */

export interface PlayRematchState {
  id: string
  isOpen: boolean
  hostId: string
  answers: { accountId: string; state: 'accepted' | 'pending' | 'declined' }[]
  // Invitation the reader still has to answer
  myInviteId: string | null
}

/**
 * Place of a finished game in its tournament
 * @typedef {Object} PlayTournamentStep
 */

export interface PlayTournamentStep {
  index: number
  gamesCount: number
  // Next game of the tournament, null after the last
  nextId: string | null
}

export interface PlayEndActionsProps {
  game: PlayGameName
  gameSlug: string
  sessionId: string
  isSeated: boolean
  rematch: PlayRematchState | null
  // Tournaments chain their own games
  canReplay: boolean
  tournament?: PlayTournamentStep | null
}

/**
 * End screen actions: replay with the same players, new game, back to the hub
 * @param {PlayEndActionsProps} props - Finished game and its replay
 * @return {JSX.Element}
 */

export const PlayEndActions = ({
  game,
  gameSlug,
  sessionId,
  isSeated,
  rematch,
  canReplay,
  tournament = null,
}: PlayEndActionsProps) => {
  const moves = usePlayMoves()
  const invites = usePlayInvites()
  const dismiss = usePlayNoticeStore((state) => state.dismiss)
  const answer = async (inviteId: string, accept: boolean) => {
    await invites.answer(inviteId, accept)
    dismiss(inviteId)
  }
  const busy = moves.isSaving || invites.isSaving
  const accepted = (rematch?.answers.filter((entry) => entry.state === 'accepted').length ?? 0) + 1
  const hasWaiting = rematch?.answers.some((entry) => entry.state === 'pending') ?? false

  return (
    <div className={PLAY_END.bar}>
      {canReplay && isSeated && rematch?.myInviteId && (
        <>
          <Button
            variant="arcade"
            className={PLAY_END.action}
            isLoading={busy}
            onClick={() => void answer(rematch.myInviteId as string, true)}
          >
            {PLAY_HUB_COPY.rematchAccept}
          </Button>
          <Button
            variant="arcadeGhost"
            className={PLAY_END.action}
            disabled={busy}
            onClick={() => void answer(rematch.myInviteId as string, false)}
          >
            {PLAY_HUB_COPY.rematchDecline}
          </Button>
        </>
      )}

      {tournament?.nextId && (
        <AppLink
          href={ROUTES.playSession(tournament.nextId)}
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcade, PLAY_END.action)}
        >
          {PLAY_HUB_COPY.tournamentNext}
        </AppLink>
      )}

      {canReplay && isSeated && !rematch && (
        <Button
          variant="arcade"
          className={PLAY_END.action}
          isLoading={busy}
          onClick={() => void moves.replay(sessionId)}
        >
          {PLAY_HUB_COPY.replay}
        </Button>
      )}

      {rematch?.isOpen && isSeated && !rematch.myInviteId && (
        <AppLink
          href={ROUTES.playSession(rematch.id)}
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcade, PLAY_END.action)}
        >
          {PLAY_HUB_COPY.replayJoin}
        </AppLink>
      )}

      <Button
        variant="arcadeGhost"
        className={PLAY_END.action}
        isLoading={busy}
        onClick={() => void moves.create(game)}
      >
        {PLAY_HUB_COPY.newGame}
      </Button>
      <AppLink
        href={ROUTES.playGame(gameSlug)}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeGhost, PLAY_END.action)}
      >
        {PLAY_HUB_COPY.backToHub}
      </AppLink>

      {tournament && (
        <p className={PLAY_END.count} role="status">
          {tournament.nextId
            ? fillPlayMessage(PLAY_HUB_COPY.tournamentStep, {
                current: tournament.index + 1,
                total: tournament.gamesCount,
              })
            : PLAY_HUB_COPY.tournamentOver}
        </p>
      )}

      {rematch && (
        <p className={PLAY_END.count} role="status">
          {fillPlayMessage(PLAY_HUB_COPY.rematchCount, {
            count: accepted,
            total: rematch.answers.length + 1,
          })}
          {hasWaiting && ` · ${PLAY_HUB_COPY.rematchWaiting}`}
        </p>
      )}
    </div>
  )
}
