'use client'

import type { SyncConflict } from '@/core/hooks/data/pages'
import { PAGE_SYNC_COPY } from '@/declarations/pages/copy'
import { BUTTON_STYLES, PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'

export interface ConflictBannerProps {
  conflict: SyncConflict
  onKeepMine: () => void
  onKeepTheirs: () => void
}

/**
 * Explicit choice between two versions
 * @param {ConflictBannerProps} props - Conflict and choices
 * @return {JSX.Element}
 */

export const ConflictBanner = ({ conflict, onKeepMine, onKeepTheirs }: ConflictBannerProps) => (
  <section role="alert" className={PAGE_VIEW_STYLES.banner}>
    <div className={PAGE_VIEW_STYLES.bannerText}>
      <p className={PAGE_VIEW_STYLES.bannerTitle}>{PAGE_SYNC_COPY.conflictTitle}</p>
      <p>{PAGE_SYNC_COPY.conflictLead}</p>
      <p className={PAGE_VIEW_STYLES.bannerMeta}>
        {[conflict.theirs.editorName, formatDayTime(conflict.theirs.contentAt)].filter(Boolean).join(' · ')}
      </p>
    </div>
    <div className={PAGE_VIEW_STYLES.bannerActions}>
      <button type="button" className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)} onClick={onKeepTheirs}>
        {PAGE_SYNC_COPY.keepTheirs}
      </button>
      <button type="button" className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)} onClick={onKeepMine}>
        {PAGE_SYNC_COPY.keepMine}
      </button>
    </div>
  </section>
)
