'use client'

import Link from 'next/link'
import type { RefObject } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { NotificationsList } from '@/composites/notifications/NotificationsList'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { ICONS } from '@/declarations/ui/icons'
import { NOTIFICATION_STYLES } from '@/declarations/ui/variants'
import type { NotificationEntry } from '@/types/notifications'

export interface NotificationsPanelProps {
  panelRef: RefObject<HTMLDivElement | null>
  entries: NotificationEntry[]
  unread: number
  isLoading: boolean
  onOpen: (id: string) => void
  onReadAll: () => void
  onLeave: () => void
}

/**
 * Vertical window raised by the bell — the page loads on opening, never on a timer
 * @param {RefObject<HTMLDivElement | null>} panelRef - Anchoring ref
 * @param {NotificationEntry[]} entries - Notifications, newest first
 * @param {number} unread - Unopened count
 * @param {boolean} isLoading - First page still in flight
 * @param {(id: string) => void} onOpen - Called once a row is settled
 * @param {() => void} onReadAll - Settle every row
 * @param {() => void} onLeave - Called when navigating out of the panel
 * @return {JSX.Element}
 */

export const NotificationsPanel = ({
  panelRef,
  entries,
  unread,
  isLoading,
  onOpen,
  onReadAll,
  onLeave,
}: NotificationsPanelProps) => {
  const SeeAllIcon = ICONS.forward

  const seeAll = (
    <Link href={ROUTES.notifications} onClick={onLeave} className={NOTIFICATION_STYLES.footerLink}>
      {NOTIFICATION_COPY.seeAll}
      <SeeAllIcon className={NOTIFICATION_STYLES.footerIcon} aria-hidden="true" />
    </Link>
  )

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={NOTIFICATION_COPY.title}
      className={NOTIFICATION_STYLES.panel}
    >
      <div className={NOTIFICATION_STYLES.header}>
        <span className={NOTIFICATION_STYLES.title}>{NOTIFICATION_COPY.title}</span>
        {unread > 0 && (
          <Button
            variant="icon"
            icon="confirm"
            aria-label={NOTIFICATION_COPY.markAll}
            title={NOTIFICATION_COPY.markAll}
            onClick={onReadAll}
          />
        )}
      </div>

      <div className={NOTIFICATION_STYLES.body}>
        {isLoading && <SkeletonList shape="row" rows={NOTIFICATION_SETTINGS.panelSize} />}
        {!isLoading && entries.length === 0 && (
          <EmptyState
            compact
            figure="notifications"
            title={NOTIFICATION_COPY.emptyTitle}
            description={NOTIFICATION_COPY.emptyDescription}
            action={seeAll}
          />
        )}
        {!isLoading && entries.length > 0 && (
          <NotificationsList entries={entries} onOpen={onOpen} />
        )}
      </div>

      {entries.length > 0 && <div className={NOTIFICATION_STYLES.footer}>{seeAll}</div>}
    </div>
  )
}
