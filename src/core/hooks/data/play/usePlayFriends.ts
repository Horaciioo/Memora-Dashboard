'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { queueRefresh } from '@/core/lib/realtime/refresh'
import { PLAY_FRIENDS_COPY } from '@/declarations/play'

/**
 * Gestures of the friends
 * @return {Object} - Gestures and pending flag
 */

export const usePlayFriends = () => {
  const router = useRouter()
  const client = useQueryClient()
  const { isSaving, run } = useMutation()

  // Page and cards read again
  const again = async <T>(action: () => Promise<T>, done?: string): Promise<boolean> => {
    const result = await run(action, done)
    if (result === null) return false
    await client.invalidateQueries({ queryKey: ['play'] })
    queueRefresh(() => router.refresh())

    return true
  }

  return {
    isSaving,
    ask: (accountId: string) =>
      again(() => apiPost(API_ROUTES.playFriends, { accountId }), PLAY_FRIENDS_COPY.added),
    answer: (requestId: string, accept: boolean) =>
      again(
        () => apiPost(API_ROUTES.playFriendAnswer(requestId), { accept }),
        accept ? PLAY_FRIENDS_COPY.accepted : undefined
      ),
    remove: (accountId: string, done?: string) =>
      again(() => apiDelete(API_ROUTES.playFriend(accountId)), done),
  }
}
