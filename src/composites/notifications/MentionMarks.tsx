'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMentionMarksStore } from '@/core/store/mentionMarks'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import type { MentionMark } from '@/types/mentions'

export interface MentionMarksProps {
  target: NotificationTargetName
  targetId: string
}

/**
 * Take the mentions of the open record and hand them to its threads
 * @param {NotificationTargetName} target - Kind of record
 * @param {string} targetId - Record identifier
 * @return {null}
 */

export const MentionMarks = ({ target, targetId }: MentionMarksProps) => {
  const router = useRouter()
  const receive = useMentionMarksStore((state) => state.receive)

  useEffect(() => {
    let isLive = true

    // Opening the record is seeing what named the viewer
    apiPost<MentionMark[]>(API_ROUTES.mentionsRead, { target, targetId })
      .then((marks) => {
        if (!isLive || marks.length === 0) return

        receive(marks)

        // The rail forgets its badge now that they are read
        router.refresh()
      })
      .catch(() => undefined)

    return () => {
      isLive = false
    }
  }, [target, targetId, receive, router])

  return null
}
