'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

import { SharePanel } from '@/composites/pages/share/SharePanel'
import { SyncStatus } from '@/composites/pages/view/SyncStatus'
import type { SyncStatus as SyncStatusName } from '@/core/hooks/data/pages'
import { useBannerHost } from '@/core/hooks/interaction/layout/useBannerHost'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import { PAGE_OPTIONS_HOST_ID } from '@/declarations/ui/banners'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import type { PageDetail } from '@/types/pages'
import { cn } from '@/utils/classnames'

export interface PageTopBarProps {
  page: PageDetail
  status: SyncStatusName
  contentAt: string
  onRetry: () => void
}

/**
 * Banner bar of a page: save state, share, link
 * @param {PageTopBarProps} props - Page and sync state
 * @return {JSX.Element | null}
 */

export const PageTopBar = ({ page, status, contentAt, onRetry }: PageTopBarProps) => {
  const host = useBannerHost(PAGE_OPTIONS_HOST_ID)
  const [isSharing, setSharing] = useState(false)
  const copy = useCopy(PAGE_SHARE_COPY.linkCopied)
  const LockIcon = ICONS[page.isShared ? 'unlock' : 'lock']
  const LinkIcon = ICONS.link

  if (!host) return null

  return createPortal(
    <div className={PAGE_VIEW_STYLES.topBar}>
      <SyncStatus status={status} contentAt={contentAt} onRetry={onRetry} />
      <div className={PAGE_VIEW_STYLES.shareHost}>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isSharing}
          className={cn(PAGE_VIEW_STYLES.shareButton, isSharing && PAGE_VIEW_STYLES.shareButtonOpen)}
          onClick={() => setSharing(!isSharing)}
        >
          <LockIcon className={PAGE_VIEW_STYLES.barGlyph} aria-hidden="true" />
          <span>{PAGE_SHARE_COPY.button}</span>
        </button>
        {isSharing && <SharePanel page={page} onClose={() => setSharing(false)} />}
      </div>
      <button
        type="button"
        aria-label={PAGE_SHARE_COPY.copyLink}
        title={PAGE_SHARE_COPY.copyLink}
        className={PAGE_VIEW_STYLES.barIcon}
        onClick={() => void copy(`${window.location.origin}${ROUTES.page(page.id)}`)}
      >
        <LinkIcon className={PAGE_VIEW_STYLES.barGlyph} aria-hidden="true" />
      </button>
    </div>,
    host
  )
}
