'use client'

import { useRouter } from 'next/navigation'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play/hub'

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
  ) => {
    const result = await run(action, done)
    if (result === null) return
    if (to) router.push(to(result))
    else router.refresh()
  }

  return {
    isSaving,
    create: (game: string) =>
      go(
        () => apiPost<{ id: string }>(API_ROUTES.playSessions, { game }),
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
    leave: (id: string) =>
      go(
        () => apiPost(API_ROUTES.playLeave(id), {}),
        PLAY_HUB_COPY.leftDone,
        () => ROUTES.play
      ),
  }
}
