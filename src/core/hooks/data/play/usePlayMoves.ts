'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { queueRefresh } from '@/core/lib/realtime/refresh'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_BOT_COPY } from '@/declarations/play/bots'
import { PLAY_HUB_COPY } from '@/declarations/play/hub'
import { PLAY_FOLLOW_COPY } from '@/declarations/play/invites'
import { GolfVoteActions } from '@/declarations/play/golf/vote'
import type { PlayBotKindName, PlayInviteRoleName } from '@/utils/constants/play'

/**
 * Player gestures of the Play pages
 * @return {Object} - Gestures and pending flag
 */

export const usePlayMoves = () => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  // A second click while one gesture runs is dropped
  const busy = useRef(false)

  // Each gesture lands on a page, or refreshes this one with the signal it raised
  const go = async <T>(
    action: () => Promise<T>,
    done: string,
    to: ((result: T) => string) | null
  ): Promise<boolean> => {
    if (busy.current) return false
    busy.current = true
    const result = await run(action, done).finally(() => {
      busy.current = false
    })
    if (result === null) return false
    if (to) router.push(to(result))
    else queueRefresh(() => router.refresh())

    return true
  }

  return {
    isSaving,
    create: (game: string, setup: Record<string, unknown> = {}) =>
      go(
        () => apiPost<{ id: string }>(API_ROUTES.playSessions, { ...setup, game }),
        PLAY_HUB_COPY.created,
        (session) => ROUTES.playSessionInvite(session.id)
      ),
    visibility: (id: string, isPrivate: boolean) =>
      go(
        () => apiPost(API_ROUTES.playVisibility(id), { isPrivate }),
        isPrivate ? PLAY_HUB_COPY.madePrivate : PLAY_HUB_COPY.madePublic,
        null
      ),
    joinCode: (code: string) =>
      go(
        () => apiPost<{ id: string }>(API_ROUTES.playJoinCode, { code }),
        PLAY_HUB_COPY.joined,
        (session) => ROUTES.playSession(session.id)
      ),
    join: (id: string) =>
      go(
        () => apiPost(API_ROUTES.playJoin(id), {}),
        PLAY_HUB_COPY.joined,
        () => ROUTES.playSession(id)
      ),
    follow: (id: string, isFollowing: boolean) =>
      go(
        () => apiPost(API_ROUTES.playFollow(id), { follow: isFollowing }),
        isFollowing ? PLAY_FOLLOW_COPY.followed : PLAY_FOLLOW_COPY.unfollowed,
        null
      ),
    start: (id: string) =>
      go(() => apiPost(API_ROUTES.playStart(id), {}), PLAY_HUB_COPY.started, null),
    openVote: (id: string) =>
      run(() => apiPost(API_ROUTES.playVote(id), { action: GolfVoteActions.Open })),
    // Quiet, the signal it raises refreshes the page
    vote: (id: string, payload: Record<string, unknown>) =>
      run(() => apiPost(API_ROUTES.playVote(id), payload)),
    rules: (id: string, setup: object) =>
      go(() => apiPatch(API_ROUTES.playSession(id), setup), PLAY_HUB_COPY.rulesSaved, null),
    replay: (id: string) =>
      go(
        () => apiPost<{ id: string }>(API_ROUTES.playRematch(id), {}),
        PLAY_HUB_COPY.replayed,
        (next) => ROUTES.playSession(next.id)
      ),
    cancel: (id: string, gameSlug: string) =>
      go(
        () => apiPost(API_ROUTES.playCancel(id), {}),
        PLAY_HUB_COPY.cancelled,
        () => ROUTES.playGame(gameSlug)
      ),
    bots: (id: string, level: PlayBotKindName, fill = false) =>
      go(
        () => apiPost(API_ROUTES.playBots(id), { level, fill }),
        fill ? PLAY_BOT_COPY.filled : PLAY_BOT_COPY.added,
        null
      ),
    // Quiet, the signal it raises refreshes the page
    ready: (id: string, ready: boolean) => run(() => apiPost(API_ROUTES.playReady(id), { ready })),
    kick: (id: string, accountId: string) =>
      go(() => apiPost(API_ROUTES.playKick(id), { accountId }), PLAY_HUB_COPY.kicked, null),
    place: (id: string, accountId: string, role: PlayInviteRoleName) =>
      go(
        () => apiPost(API_ROUTES.playSeatRole(id), { accountId, role }),
        PLAY_HUB_COPY.moved,
        null
      ),
    leave: (id: string) => {
      // The hub loads while the request runs
      router.prefetch(ROUTES.play)

      return go(
        () => apiPost(API_ROUTES.playLeave(id), {}),
        PLAY_HUB_COPY.leftDone,
        () => ROUTES.play
      )
    },
  }
}
