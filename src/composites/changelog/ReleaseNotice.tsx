'use client'

import Link from 'next/link'

import { useFreshRelease } from '@/core/hooks/data/useFreshRelease'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { ROUTES } from '@/declarations/navigation'
import { RELEASE_NOTICE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface ReleaseNoticeProps {
  // Hung under a shortcut box, 0 to 1 across the row
  pointedAt?: number
  onNavigate?: () => void
}

/**
 * Unread note card
 * @param {number} [pointedAt] - Draws the point under this share of the row
 * @param {() => void} [onNavigate] - Navigation handler
 * @return {JSX.Element | null}
 */

export const ReleaseNotice = ({ pointedAt, onNavigate }: ReleaseNoticeProps) => {
  const { release, isFresh, markSeen } = useFreshRelease()
  if (!release || !isFresh) return null

  const CloseIcon = ICONS.close
  const ChevronIcon = ICONS.next

  const isPointed = pointedAt !== undefined

  return (
    <div className={cn(RELEASE_NOTICE.wrap, isPointed && RELEASE_NOTICE.wrapPointed)}>
      {isPointed && (
        <span
          className={RELEASE_NOTICE.caret}
          style={{ left: `calc(${pointedAt * 100}% - 0.375rem)` }}
          aria-hidden="true"
        />
      )}

      <div className={RELEASE_NOTICE.frame}>
        <span className={RELEASE_NOTICE.veil} aria-hidden="true" />
        <Link href={ROUTES.changelog} onClick={onNavigate} className={RELEASE_NOTICE.link}>
          <span className={RELEASE_NOTICE.sheen} aria-hidden="true" />
          <span className={RELEASE_NOTICE.kicker}>
            {CHANGELOG_COPY.versionLabel(release.version)}
          </span>
          <span className={RELEASE_NOTICE.title}>{release.title}</span>
          <span className={RELEASE_NOTICE.cta}>
            {CHANGELOG_COPY.noticeCta}
            <ChevronIcon className={RELEASE_NOTICE.ctaIcon} aria-hidden="true" />
          </span>
        </Link>

        <button
          type="button"
          aria-label={CHANGELOG_COPY.noticeDismiss}
          title={CHANGELOG_COPY.noticeDismiss}
          className={RELEASE_NOTICE.dismiss}
          onClick={markSeen}
        >
          <CloseIcon className={RELEASE_NOTICE.dismissIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
