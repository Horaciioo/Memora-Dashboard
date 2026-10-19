'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_SIDEBAR } from '@/declarations/ui/variants'

export interface LeaveModViewButtonProps {
  liveId: string
}

/**
 * Exit glyph asking whether the member stops moderating before leaving
 * @param {string} liveId - Live left
 * @return {JSX.Element}
 */

export const LeaveModViewButton = ({ liveId }: LeaveModViewButtonProps) => {
  const [isAsking, setAsking] = useState(false)
  const { isSaving, run } = useMutation()
  const router = useRouter()
  const ExitIcon = ICONS.signOut

  // Leaving always keeps moderating, unless they stop
  const leave = async (isStopping: boolean) => {
    if (isStopping) {
      const stopped = await run(() => apiPost(API_ROUTES.liveModStop(liveId), {}))
      if (!stopped) return
    }
    router.push(ROUTES.dashboard)
  }

  return (
    <>
      <button
        type="button"
        className={MODVIEW_SIDEBAR.button}
        aria-label={MODVIEW_COPY.back}
        title={MODVIEW_COPY.back}
        onClick={() => setAsking(true)}
      >
        <ExitIcon className={MODVIEW_SIDEBAR.icon} aria-hidden="true" />
      </button>
      <Dialog
        open={isAsking}
        onClose={() => setAsking(false)}
        title={MODVIEW_COPY.leaveTitle}
        size="xs"
        footer={
          <div className={MODVIEW_SIDEBAR.leaveChoices}>
            <Button
              variant="success"
              className="w-full"
              disabled={isSaving}
              onClick={() => void leave(false)}
            >
              {MODVIEW_COPY.leaveKeep}
            </Button>
            <div className={MODVIEW_SIDEBAR.leaveDivider} role="separator" />
            <Button
              variant="danger"
              className="w-full"
              isLoading={isSaving}
              onClick={() => void leave(true)}
            >
              {MODVIEW_COPY.leaveStop}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-ink-subtle)]">{MODVIEW_COPY.leaveLead}</p>
      </Dialog>
    </>
  )
}
