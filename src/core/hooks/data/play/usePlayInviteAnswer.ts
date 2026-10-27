'use client'

import { usePlayInvites } from '@/core/hooks/data/play/usePlayInvites'
import { usePlayInviteStore } from '@/core/store/playInvites'
import type { PlayInviteView } from '@/types/play'

/**
 * Accept an invitation and go there, or close it
 * @param {PlayInviteView} invite - Invitation
 * @return {Object} - Gestures and pending flag
 */

export const usePlayInviteAnswer = (invite: PlayInviteView) => {
  const { isSaving, answer } = usePlayInvites()
  const dismiss = usePlayInviteStore((state) => state.dismiss)

  return {
    isSaving,
    accept: async () => {
      await answer(invite.id, true)
      dismiss(invite.id)
    },
    // A call to all of Memora is only closed here
    decline: () => {
      dismiss(invite.id)
      if (!invite.isEveryone) void answer(invite.id, false)
    },
  }
}
