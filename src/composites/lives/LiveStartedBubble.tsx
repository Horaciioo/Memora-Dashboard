'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { liveStartedKey } from '@/declarations/academy/welcome'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_STARTED_BUBBLE } from '@/declarations/ui/variants'

export interface LiveStartedBubbleProps {
  liveId: string
  creator: string
}

/**
 * A live just started
 * @param {string} liveId - Live on air
 * @param {string} creator - Its creator
 * @return {JSX.Element | null}
 */

export const LiveStartedBubble = ({ liveId, creator }: LiveStartedBubbleProps) => {
  const router = useRouter()
  const [isClosed, setClosed] = useState(false)
  const Dot = ICONS.liveDot

  if (isClosed) return null

  // Seen for good whatever the answer
  const close = async (join: boolean) => {
    setClosed(true)
    await apiPost(API_ROUTES.seenGuide, { key: liveStartedKey(liveId) }).catch(() => null)
    if (join) router.push(ROUTES.live(liveId))
  }

  return (
    <div className={LIVE_STARTED_BUBBLE.root} role="status">
      <p className={LIVE_STARTED_BUBBLE.title}>
        <Dot className={LIVE_STARTED_BUBBLE.glyph} aria-hidden="true" />
        {LIVE_PAGE_COPY.startedTitle}
      </p>
      <p className={LIVE_STARTED_BUBBLE.body}>
        {LIVE_PAGE_COPY.startedBody.replace('{creator}', creator)}
      </p>
      <div className={LIVE_STARTED_BUBBLE.actions}>
        <Button variant="danger" onClick={() => void close(true)}>
          {LIVE_PAGE_COPY.startedJoin}
        </Button>
        <Button variant="ghost" onClick={() => void close(false)}>
          {LIVE_PAGE_COPY.startedDismiss}
        </Button>
      </div>
    </div>
  )
}
