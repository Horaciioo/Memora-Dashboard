'use client'

import type { DocLinkStatus as SyncStatusName } from '@/core/lib/realtime/docLink'
import { PAGE_SYNC_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatSince } from '@/utils/format/dates'

export interface SyncStatusProps {
  status: SyncStatusName
  contentAt: string
  onRetry: () => void
}

// Glyph and wording per state
const STATES: Record<SyncStatusName, { icon: IconName; label: string; isAlert?: boolean }> = {
  saved: { icon: 'synced', label: PAGE_SYNC_COPY.saved },
  pending: { icon: 'syncing', label: PAGE_SYNC_COPY.pending },
  saving: { icon: 'syncing', label: PAGE_SYNC_COPY.saving },
  offline: { icon: 'unsynced', label: PAGE_SYNC_COPY.offline, isAlert: true },
  failed: { icon: 'unsynced', label: PAGE_SYNC_COPY.failed, isAlert: true },
}

/**
 * Quiet save state, the last edit time once saved
 * @param {SyncStatusProps} props - State and retry
 * @return {JSX.Element}
 */

export const SyncStatus = ({ status, contentAt, onRetry }: SyncStatusProps) => {
  const state = STATES[status]
  const Glyph = ICONS[state.icon]
  const label =
    status === 'saved'
      ? PAGES_COPY.editedAgo.replace('{ago}', formatSince(contentAt).toLowerCase())
      : state.label

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(PAGE_VIEW_STYLES.sync, state.isAlert && PAGE_VIEW_STYLES.syncAlert)}
    >
      <Glyph className={PAGE_VIEW_STYLES.syncGlyph} aria-hidden="true" />
      <span className={PAGE_VIEW_STYLES.syncLabel}>{label}</span>
      {status === 'failed' && (
        <button type="button" className={PAGE_VIEW_STYLES.syncRetry} onClick={onRetry}>
          {PAGE_SYNC_COPY.retry}
        </button>
      )}
    </span>
  )
}
