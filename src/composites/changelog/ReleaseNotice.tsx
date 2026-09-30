'use client'

import Link from 'next/link'

import { useFreshRelease } from '@/core/hooks/data/useFreshRelease'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { ROUTES } from '@/declarations/navigation'
import { RELEASE_NOTICE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface ReleaseNoticeProps {
  // Hung under the rail's version entry, its point aimed at it
  pointed?: boolean
  onNavigate?: () => void
}

/**
 * Unread note card, the same on the rail and on the home page
 * @param {boolean} [pointed] - Draws the point
 * @param {() => void} [onNavigate] - Navigation handler
 * @return {JSX.Element | null}
 */

export const ReleaseNotice = ({ pointed, onNavigate }: ReleaseNoticeProps) => {
  const { release, isFresh, markSeen } = useFreshRelease()
  if (!release || !isFresh) return null

  const CloseIcon = ICONS.close
  const ChevronIcon = ICONS.next

  return (
    <div className={cn(RELEASE_NOTICE.wrap, pointed && RELEASE_NOTICE.wrapPointed)}>
      {pointed && <span className={RELEASE_NOTICE.caret} aria-hidden="true" />}

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
