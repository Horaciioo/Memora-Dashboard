'use client'

import { useRouter } from 'next/navigation'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { queueRefresh } from '@/core/lib/realtime/refresh'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { PLAY_GROUP_COPY } from '@/declarations/play/group'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Gestures of the group tab
 * @return {Object} - Gestures and pending flag
 */

export const usePlayGroup = () => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  // Each gesture reads the page again
  const again = async <T>(action: () => Promise<T>, done?: string): Promise<boolean> => {
    const result = await run(action, done)
    if (result === null) return false
    queueRefresh(() => router.refresh())

    return true
  }

  return {
    isSaving,
    create: (name?: string) => again(() => apiPost(API_ROUTES.playGroup, { name })),
    rename: (groupId: string, name: string) =>
      again(() => apiPatch(API_ROUTES.playGroupOf(groupId), { name })),
    dissolve: (groupId: string) => again(() => apiDelete(API_ROUTES.playGroupOf(groupId))),
    invite: (groupId: string, accountIds: string[]) =>
      again(
        () => apiPost(API_ROUTES.playGroupMembers(groupId), { accountIds }),
        PLAY_GROUP_COPY.invited
      ),
    answer: (inviteId: string, accept: boolean) =>
      again(() => apiPost(API_ROUTES.playGroupInvitation(inviteId), { accept })),
    remove: (groupId: string, accountId: string) =>
      again(() => apiDelete(API_ROUTES.playGroupMember(groupId, accountId))),
    propose: (groupId: string, game: PlayGameName) =>
      again(() => apiPost(API_ROUTES.playGroupProposals(groupId), { game })),
    drop: (groupId: string, proposalId: string) =>
      again(() => apiDelete(API_ROUTES.playGroupProposal(groupId, proposalId))),
    say: (groupId: string, body: string) =>
      again(() => apiPost(API_ROUTES.playGroupMessages(groupId), { body })),
    launch: (groupId: string, game: PlayGameName) =>
      again(
        () => apiPost<{ id: string }>(API_ROUTES.playGroupLaunch(groupId), { game }),
        PLAY_GROUP_COPY.launched
      ),
  }
}
