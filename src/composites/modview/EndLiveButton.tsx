'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { LiveEndedDialog } from '@/composites/lives/LiveEndedDialog'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { entityFeedback } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'
import { MODVIEW_SIDEBAR } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { LiveStatuses } from '@/utils/constants/lives'

export interface EndLiveButtonProps {
  liveId: string
}

/**
 * Sidebar button closing the live for the whole team, after a confirmation
 * @param {string} liveId - Live to close
 * @return {JSX.Element}
 */

export const EndLiveButton = ({ liveId }: EndLiveButtonProps) => {
  const [isConfirming, setConfirming] = useState(false)
  const [isEnded, setEnded] = useState(false)
  const { isSaving, run } = useMutation()
  const router = useRouter()

  const end = async () => {
    const ended = await run(
      () => apiPatch<LiveView>(API_ROUTES.live(liveId), { status: LiveStatuses.Ended }),
      entityFeedback('live', 'saved')
    )
    setConfirming(false)
    if (ended) setEnded(true)
  }

  return (
    <>
      <button
        type="button"
        className={MODVIEW_SIDEBAR.end}
        aria-label={LIVE_COPY.end}
        title={LIVE_COPY.end}
        onClick={() => setConfirming(true)}
      >
        <ICONS.lock className={cn(MODVIEW_SIDEBAR.icon, 'text-[var(--color-danger)]')} />
      </button>
      <ConfirmDialog
        open={isConfirming}
        title={LIVE_COPY.end}
        description={LIVE_COPY.confirmEnd}
        confirmLabel={LIVE_COPY.end}
        pending={isSaving}
        onCancel={() => setConfirming(false)}
        onConfirm={end}
      />
      <LiveEndedDialog liveId={isEnded ? liveId : null} onClose={() => router.push(ROUTES.lives)} />
    </>
  )
}
