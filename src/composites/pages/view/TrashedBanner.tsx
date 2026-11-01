'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { usePageActions } from '@/core/hooks/data/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { BUTTON_STYLES, PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface TrashedBannerProps {
  pageId: string
}

/**
 * Trashed page notice with restore and erase
 * @param {string} pageId - Page id
 * @return {JSX.Element}
 */

export const TrashedBanner = ({ pageId }: TrashedBannerProps) => {
  const router = useRouter()
  const { restore, purge } = usePageActions()
  const [isConfirming, setConfirming] = useState(false)

  return (
    <section role="status" className={PAGE_VIEW_STYLES.banner}>
      <p className={PAGE_VIEW_STYLES.bannerTitle}>{PAGES_COPY.trashedBanner}</p>
      <div className={PAGE_VIEW_STYLES.bannerActions}>
        <button type="button" className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)} onClick={() => setConfirming(true)}>
          {PAGES_COPY.trashPurge}
        </button>
        <button type="button" className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)} onClick={() => void restore(pageId).then(() => router.refresh())}>
          {PAGES_COPY.trashRestore}
        </button>
      </div>
      <ConfirmDialog
        open={isConfirming}
        title={PAGES_COPY.trashPurge}
        description={PAGES_COPY.trashPurgeConfirm}
        confirmLabel={PAGES_COPY.trashPurge}
        tone="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={() => void purge(pageId).then(() => router.push(ROUTES.pagesTrash))}
      />
    </section>
  )
}
