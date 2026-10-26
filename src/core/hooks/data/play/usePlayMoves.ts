'use client'

import { useRouter } from 'next/navigation'

import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play/hub'
import type { PlayInviteRoleName } from '@/utils/constants/play'

/**
 * Player gestures of the Play pages
 * @return {Object} - Gestures and pending flag
 */

export const usePlayMoves = () => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  // Each gesture lands on a page, or refreshes this one
  const go = async <T>(
    action: () => Promise<T>,
    done: string,
    to: ((result: T) => string) | null
  ): Promise<boolean> => {
    const result = await run(action, done)
    if (result === null) return false
    if (to) router.push(to(result))
    else router.refresh()

    return true
  }

  return {
    isSaving,
    create: (game: string, setup: Record<string, unknown> = {}) =>
      go(
        () => apiPost<{ id: string }>(API_ROUTES.playSessions, { ...setup, game }),
        PLAY_HUB_COPY.created,
        (session) => ROUTES.playSession(session.id)
      ),
    join: (id: string) =>
      go(
        () => apiPost(API_ROUTES.playJoin(id), {}),
        PLAY_HUB_COPY.joined,
        () => ROUTES.playSession(id)
      ),
    start: (id: string) =>
      go(() => apiPost(API_ROUTES.playStart(id), {}), PLAY_HUB_COPY.started, null),
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
    kick: (id: string, accountId: string) =>
      go(() => apiPost(API_ROUTES.playKick(id), { accountId }), PLAY_HUB_COPY.kicked, null),
    place: (id: string, accountId: string, role: PlayInviteRoleName) =>
      go(
        () => apiPost(API_ROUTES.playSeatRole(id), { accountId, role }),
        PLAY_HUB_COPY.moved,
        null
      ),
    leave: (id: string) =>
      go(
        () => apiPost(API_ROUTES.playLeave(id), {}),
        PLAY_HUB_COPY.leftDone,
        () => ROUTES.play
      ),
  }
}
