'use client'

import { useRouter } from 'next/navigation'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play/hub'
import type { PlayInviteRoleName } from '@/utils/constants/play'

/**
 * Who an invitation calls
 * @typedef {Object} PlayInviteTarget
 */

export type PlayInviteTarget = { everyone: true } | { accountIds: string[] }

/**
 * Send and answer Play invitations
 * @return {Object} - Gestures and pending flag
 */

export const usePlayInvites = () => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  return {
    isSaving,
    invite: async (sessionId: string, role: PlayInviteRoleName, target: PlayInviteTarget) => {
      const done = await run(
        () => apiPost(API_ROUTES.playInvite(sessionId), { role, ...target }),
        PLAY_HUB_COPY.invited
      )
      if (done !== null) router.refresh()

      return done !== null
    },
    answer: async (inviteId: string, accept: boolean) => {
      const result = await run(() =>
        apiPost<{ sessionId: string }>(API_ROUTES.playInviteAnswer(inviteId), { accept })
      )
      if (result === null) return
      if (accept) router.push(ROUTES.playSession(result.sessionId))
      else router.refresh()
    },
  }
}
