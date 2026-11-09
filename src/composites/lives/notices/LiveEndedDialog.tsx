'use client'

import { useRouter } from 'next/navigation'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'

export interface LiveEndedDialogProps {
  // Live just closed, none keeps the dialog away
  liveId: string | null
  // Report left for later
  onClose: () => void
}

/**
 * Offers the report to whoever just closed a live
 * @param {string | null} liveId - Live closed
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const LiveEndedDialog = ({ liveId, onClose }: LiveEndedDialogProps) => {
  const router = useRouter()

  return (
    <ConfirmDialog
      open={liveId !== null}
      tone="brand"
      title={LIVE_COPY.endedTitle}
      description={LIVE_COPY.endedDescription}
      confirmLabel={LIVE_COPY.seeReport}
      onCancel={onClose}
      onConfirm={() => {
        if (liveId) router.push(ROUTES.liveReport(liveId))
      }}
    />
  )
}
