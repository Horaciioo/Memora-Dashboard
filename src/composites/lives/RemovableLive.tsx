'use client'

import type { ReactNode } from 'react'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import type { LiveRemoval } from '@/core/hooks/data/lives/useLiveRemoval'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'

/**
 * Row of a finished live, erased from its right click menu
 * @param {Object} props - Live, erasure state and content
 * @return {JSX.Element}
 */

export const RemovableLive = ({
  liveId,
  removal,
  enabled,
  className,
  children,
}: {
  liveId: string
  removal: LiveRemoval
  enabled: boolean
  className?: string
  children: ReactNode
}) => {
  const menu = useActionMenu(
    enabled
      ? [
          {
            id: 'remove',
            label: LIVE_REPORT_COPY.removeLive,
            icon: 'remove',
            onSelect: () => removal.ask(liveId),
          },
        ]
      : []
  )

  return (
    <li className={className} onContextMenu={enabled ? menu.onContextMenu : undefined}>
      {children}
    </li>
  )
}

/**
 * Confirmation closing an erasure
 * @param {Object} props - Erasure state
 * @return {JSX.Element}
 */

export const LiveRemovalDialog = ({ removal }: { removal: LiveRemoval }) => (
  <ConfirmDialog
    open={removal.target !== null}
    title={LIVE_REPORT_COPY.removeTitle}
    description={LIVE_REPORT_COPY.removeDescription}
    tone="danger"
    pending={removal.isSaving}
    onCancel={removal.cancel}
    onConfirm={() => void removal.confirm()}
  />
)
