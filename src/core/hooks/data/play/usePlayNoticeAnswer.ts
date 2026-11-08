'use client'

import { useRouter } from 'next/navigation'

import { usePlayInvites } from '@/core/hooks/data/play/usePlayInvites'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { isFollowedNotice } from '@/core/lib/play/notices'
import { usePlayNoticeStore } from '@/core/store/play/playNotices'
import { ROUTES } from '@/declarations/navigation'
import type { PlayNoticeView } from '@/types/play'

/**
 * Take the main gesture of a news and go there, or close it
 * @param {PlayNoticeView} notice - News
 * @return {Object} - Gestures and pending flag
 */

export const usePlayNoticeAnswer = (notice: PlayNoticeView) => {
  const router = useRouter()
  const invites = usePlayInvites()
  const { isSaving, run } = useMutation()
  const dismiss = usePlayNoticeStore((state) => state.dismiss)
  const isFollowed = isFollowedNotice(notice)

  // A followed game news is deleted, an invitation answered
  const close = async (): Promise<boolean> =>
    (await run(async () => {
      await apiDelete(API_ROUTES.playNoticeClose(notice.id))

      return true
    })) === true

  return {
    isSaving: isSaving || invites.isSaving,
    accept: async () => {
      if (!isFollowed) await invites.answer(notice.id, true)
      else if (await close()) router.push(ROUTES.playSession(notice.sessionId))
      dismiss(notice.id)
    },
    // A call to all of Memora is only closed here
    decline: () => {
      dismiss(notice.id)
      if (isFollowed) void close()
      else if (!notice.isEveryone) void invites.answer(notice.id, false)
    },
  }
}
