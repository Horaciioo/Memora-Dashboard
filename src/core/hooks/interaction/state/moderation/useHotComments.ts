'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { useMentionMarksStore } from '@/core/store/mentionMarks'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { CommentView } from '@/types/comments'
import { readMentions } from '@/utils/format/mentions'

/**
 * Remarks that named the viewer, lit until hovered or until the delay passes
 * @param {CommentView[]} comments - Remarks of a thread
 * @return {Object} - Lit remarks, the way to calm one, to bring one back
 */

export const useHotComments = (comments: CommentView[]) => {
  const router = useRouter()
  const { session } = useAuthContext()
  const { run } = useMutation()
  const marks = useMentionMarksStore((state) => state.marks)
  const forced = useMentionMarksStore((state) => state.forced)
  const calmed = useMentionMarksStore((state) => state.calmed)
  const calmMany = useMentionMarksStore((state) => state.calm)
  const light = useMentionMarksStore((state) => state.light)

  // A mark is raised right after its remark by the same author
  const ids = useMemo(
    () =>
      comments
        .filter(
          (comment) =>
            !calmed.includes(comment.id) &&
            (forced.includes(comment.id) ||
              marks.some((mark) => {
                const gap = Date.parse(mark.at) - Date.parse(comment.createdAt)

                return (
                  mark.actorName === comment.authorName &&
                  gap >= 0 &&
                  gap <= NOTIFICATION_SETTINGS.mentionMatchMs
                )
              }))
        )
        .map((comment) => comment.id),
    [comments, marks, forced, calmed]
  )

  // Back to normal after the delay
  const key = ids.join('|')
  useEffect(() => {
    if (!key) return

    const timer = setTimeout(() => calmMany(key.split('|')), NOTIFICATION_SETTINGS.mentionCalmMs)

    return () => clearTimeout(timer)
  }, [key, calmMany])

  // The viewer is named in the remark
  const names = (comment: CommentView): boolean =>
    readMentions(comment.body, NOTIFICATION_SETTINGS.maxMentions).handles.some(
      (handle) => handle.toLowerCase() === session?.displayName.toLowerCase()
    )

  // Lights it again, as unseen
  const restore = async (id: string) => {
    const done = await run(() => apiPost<{ done: boolean }>(API_ROUTES.commentUnread(id), {}))
    if (!done) return

    light(id)
    router.refresh()
  }

  return { hot: new Set(ids), calm: (id: string) => calmMany([id]), names, restore }
}
