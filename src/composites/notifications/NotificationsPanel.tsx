'use client'

import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { NotificationsList } from '@/composites/notifications/NotificationsList'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { RAIL_POPOVER } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { NOTIFICATION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { NotificationEntry } from '@/types/notifications'

export interface NotificationsPanelProps {
  entries: NotificationEntry[]
  unread: number
  isLoading: boolean
  onOpen: (id: string) => void
  onReadAll: () => void
  onLeave: () => void
}

/**
 * Box raised by the bell beside the rail, the page loading on opening, never on a timer
 * @param {NotificationEntry[]} entries - Notifications, newest first
 * @param {number} unread - Unopened count
 * @param {boolean} isLoading - First page still in flight
 * @param {(id: string) => void} onOpen - Called once a row is settled
 * @param {() => void} onReadAll - Settle every row
 * @param {() => void} onLeave - Called when navigating out of the panel
 * @return {JSX.Element}
 */

export const NotificationsPanel = ({
  entries,
  unread,
  isLoading,
  onOpen,
  onReadAll,
  onLeave,
}: NotificationsPanelProps) => {
  const SeeAllIcon = ICONS.forward
  const BellIcon = ICONS.bell

  const seeAll = (
    <Link href={ROUTES.notifications} onClick={onLeave} className={NOTIFICATION_STYLES.footerLink}>
      {NOTIFICATION_COPY.seeAll}
      <SeeAllIcon className={NOTIFICATION_STYLES.footerIcon} aria-hidden="true" />
    </Link>
  )

  return (
    <div
      role="dialog"
      aria-label={NOTIFICATION_COPY.title}
      className={cn(RAIL_POPOVER.panel, RAIL_POPOVER.bell)}
    >
      <div className={RAIL_POPOVER.head}>
        <BellIcon className={RAIL_POPOVER.headGlyph} aria-hidden="true" />
        <p className={RAIL_POPOVER.headTitle}>{NOTIFICATION_COPY.title}</p>
        <p className={RAIL_POPOVER.headMeta}>
          {unread > 0 ? NOTIFICATION_COPY.metaUnread : NOTIFICATION_COPY.metaRead}
        </p>
        {unread > 0 && (
          <Button
            variant="icon"
            icon="confirm"
            aria-label={NOTIFICATION_COPY.markAll}
            title={NOTIFICATION_COPY.markAll}
            onClick={onReadAll}
            className={RAIL_POPOVER.headAction}
          />
        )}
      </div>

      <div className={RAIL_POPOVER.body}>
        {isLoading && (
          <>
            <div className="flex justify-center py-2">
              <BrandLoader variant="ink" />
            </div>
            <SkeletonList shape="row" rows={NOTIFICATION_SETTINGS.panelSize} />
          </>
        )}
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
