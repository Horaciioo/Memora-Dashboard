'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { liveStartedKey } from '@/declarations/academy/welcome'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { LIVE_STARTED_BUBBLE } from '@/declarations/ui/variants'

// Life before it folds
const BUBBLE_LIFE_MS = 8000

export interface LiveStartedBubbleProps {
  liveId: string
}

/**
 * Pill announcing a live
 * @param {string} liveId - Live on air
 * @return {JSX.Element | null}
 */

export const LiveStartedBubble = ({ liveId }: LiveStartedBubbleProps) => {
  const router = useRouter()
  const [isClosed, setClosed] = useState(false)

  // Seen for good once gone
  const close = (join: boolean) => {
    setClosed(true)
    void apiPost(API_ROUTES.seenGuide, { key: liveStartedKey(liveId) }).catch(() => null)
    if (join) router.push(ROUTES.live(liveId))
  }

  // Folds by itself
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setClosed(true)
      void apiPost(API_ROUTES.seenGuide, { key: liveStartedKey(liveId) }).catch(() => null)
    }, BUBBLE_LIFE_MS)

    return () => window.clearTimeout(timer)
  }, [liveId])

  if (isClosed) return null

  return (
    <button
      type="button"
      className={LIVE_STARTED_BUBBLE.root}
      role="status"
      onClick={() => close(true)}
    >
      <svg
        viewBox="0 0 12 18"
        className={LIVE_STARTED_BUBBLE.tail}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0.5C8.6 3 4.6 6.4 1.3 8.1a1.05 1.05 0 0 0 0 1.8C4.6 11.6 8.6 15 12 17.5Z"
          fill="currentColor"
        />
      </svg>
      {LIVE_PAGE_COPY.startedBubble}
    </button>
  )
}
