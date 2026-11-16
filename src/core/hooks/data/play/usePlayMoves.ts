'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { queueRefresh } from '@/core/lib/realtime/refresh'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { usePlayBusyStore } from '@/core/store/play/playBusy'
import { usePlayLoadingGameStore } from '@/core/store/play/playLoadingGame'
import { ROUTES } from '@/declarations/navigation'
import { areBotsAwake, PLAY_BOT_COPY } from '@/declarations/play/bots'
import { PLAY_GAMES } from '@/declarations/play/games'
import { PLAY_HUB_COPY } from '@/declarations/play/hub'
import { PLAY_BUSY } from '@/declarations/play/loading'
import type { PlayBusyGesture } from '@/declarations/play/loading'
import { PLAY_FOLLOW_COPY } from '@/declarations/play/invites'
import { GolfVoteActions } from '@/declarations/play/golf/vote'
import { PlayBotKinds, PlayVisibilities } from '@/utils/constants/play'
import type { PlayBotKindName, PlayGameName, PlayInviteRoleName } from '@/utils/constants/play'

/**
 * Player gestures of the Play pages
 * @return {Object} - Gestures and pending flag
 */

export const usePlayMoves = () => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  // A second click while one gesture runs is dropped
  const busy = useRef(false)
  const begin = usePlayBusyStore((state) => state.begin)
  const aim = usePlayLoadingGameStore((state) => state.aim)

  // The loading logo shows while the server answers
  const track =
    <T>(gesture: PlayBusyGesture, action: () => Promise<T>) =>
    async (): Promise<T> => {
      const end = begin(PLAY_BUSY.label[gesture])
      try {
        return await action()
      } finally {
        end()
      }
    }

  // Each gesture lands on a page, or refreshes this one with the signal it raised
  const go = async <T>(
    action: () => Promise<T>,
    done: string,
    to: ((result: T) => string) | null,
    game: PlayGameName | null = null
  ): Promise<boolean> => {
    if (busy.current) return false
    busy.current = true
    const result = await run(action, done).finally(() => {
      busy.current = false
    })
    if (result === null) return false
    if (to) {
      // The loading screen of the next page wears this game
      aim(game)
      router.push(to(result))
    } else queueRefresh(() => router.refresh())

    return true
  }

  return {
    isSaving,
    create: (game: PlayGameName, setup: Record<string, unknown> = {}) =>
      go(
        track('create', () => apiPost<{ id: string }>(API_ROUTES.playSessions, { ...setup, game })),
        PLAY_HUB_COPY.created,
        (session) => ROUTES.playSessionInvite(session.id),
        game
      ),
    // Private table started at once, straight into the game without the invite screen
    solo: (game: PlayGameName, setup: Record<string, unknown> = {}) =>
      go(
        track('solo', async () => {
          const table = await apiPost<{ id: string }>(API_ROUTES.playSessions, {
            ...setup,
            game,
            visibility: PlayVisibilities.Private,
          })
          try {
            // Bots fill the table only while they are awake, native nations play on regardless
            if (PLAY_GAMES.get(game).soloBots && areBotsAwake(game)) {
              await apiPost(API_ROUTES.playBots(table.id), { level: PlayBotKinds.Medium, fill: true })
            }
            await apiPost(API_ROUTES.playStart(table.id), {})
          } catch (error) {
            // A table that never started is closed, not left waiting
            await apiPost(API_ROUTES.playCancel(table.id), {}).catch(() => null)
            throw error
          }

          return table
        }),
        PLAY_HUB_COPY.started,
        (table) => ROUTES.playSession(table.id),
        game
      ),
    visibility: (id: string, isPrivate: boolean) =>
      go(
        track('default', () => apiPost(API_ROUTES.playVisibility(id), { isPrivate })),
        isPrivate ? PLAY_HUB_COPY.madePrivate : PLAY_HUB_COPY.madePublic,
        null
      ),
    joinCode: (code: string) =>
      go(
        track('joinCode', () => apiPost<{ id: string }>(API_ROUTES.playJoinCode, { code })),
        PLAY_HUB_COPY.joined,
        (session) => ROUTES.playSession(session.id)
      ),
    join: (id: string) =>
      go(
        track('join', () => apiPost(API_ROUTES.playJoin(id), {})),
        PLAY_HUB_COPY.joined,
        () => ROUTES.playSession(id)
      ),
    follow: (id: string, isFollowing: boolean) =>
      go(
        track('default', () => apiPost(API_ROUTES.playFollow(id), { follow: isFollowing })),
        isFollowing ? PLAY_FOLLOW_COPY.followed : PLAY_FOLLOW_COPY.unfollowed,
        null
      ),
    start: (id: string) =>
      go(
        track('start', () => apiPost(API_ROUTES.playStart(id), {})),
        PLAY_HUB_COPY.started,
        null
      ),
    openVote: (id: string) =>
      run(() => apiPost(API_ROUTES.playVote(id), { action: GolfVoteActions.Open })),
    // Quiet, the signal it raises refreshes the page
    vote: (id: string, payload: Record<string, unknown>) =>
      run(() => apiPost(API_ROUTES.playVote(id), payload)),
    rules: (id: string, setup: object) =>
      go(
        track('rules', () => apiPatch(API_ROUTES.playSession(id), setup)),
        PLAY_HUB_COPY.rulesSaved,
        null
      ),
    replay: (id: string) =>
      go(
        track('replay', () => apiPost<{ id: string }>(API_ROUTES.playRematch(id), {})),
        PLAY_HUB_COPY.replayed,
        (next) => ROUTES.playSession(next.id)
      ),
    cancel: (id: string, gameSlug: string) =>
      go(
        track('cancel', () => apiPost(API_ROUTES.playCancel(id), {})),
        PLAY_HUB_COPY.cancelled,
        () => ROUTES.playGame(gameSlug)
      ),
    end: (id: string, gameSlug: string) =>
      go(
        track('end', () => apiPost(API_ROUTES.playEnd(id), {})),
        PLAY_HUB_COPY.ended,
        () => ROUTES.playGame(gameSlug)
      ),
    bots: (id: string, level: PlayBotKindName, fill = false) =>
      go(
        track('bots', () => apiPost(API_ROUTES.playBots(id), { level, fill })),
        fill ? PLAY_BOT_COPY.filled : PLAY_BOT_COPY.added,
        null
      ),
    // Quiet, the signal it raises refreshes the page
    ready: (id: string, ready: boolean) =>
      run(
        track('ready', async () => {
          await apiPost(API_ROUTES.playReady(id), { ready })

          return true
        })
      ),
    kick: (id: string, accountId: string) =>
      go(
        track('kick', () => apiPost(API_ROUTES.playKick(id), { accountId })),
        PLAY_HUB_COPY.kicked,
        null
      ),
    place: (id: string, accountId: string, role: PlayInviteRoleName) =>
      go(
        track('default', () => apiPost(API_ROUTES.playSeatRole(id), { accountId, role })),
        PLAY_HUB_COPY.moved,
        null
      ),
    leave: (id: string) => {
      // The hub loads while the request runs
      router.prefetch(ROUTES.play)

      return go(
        track('leave', () => apiPost(API_ROUTES.playLeave(id), {})),
        PLAY_HUB_COPY.leftDone,
        () => ROUTES.play
      )
    },
  }
}
