'use client'

import { useEffect } from 'react'
import Link from '@/components/elements/navigation/AppLink'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { NotificationsList } from '@/composites/notifications/NotificationsList'
import { useNotificationFeed } from '@/core/hooks/data/system/useNotificationFeed'
import { useNotificationsStore } from '@/core/store/notifications'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { ACCOUNT_NOTIFICATIONS } from '@/declarations/ui/blocks'

export interface AccountNotificationsProps {
  onNavigate: () => void
}

/**
 * Latest notifications in the account box
 * @param {() => void} onNavigate - Close on leave
 * @return {JSX.Element}
 */

export const AccountNotifications = ({ onNavigate }: AccountNotificationsProps) => {
  // The store is seeded already, its count is kept
  const feed = useNotificationFeed(
    { entries: [], unread: useNotificationsStore.getState().feed.unread },
    NOTIFICATION_SETTINGS.panelSize
  )
  const { load } = feed

  useEffect(() => load(), [load])

  const entries = feed.entries.slice(0, NOTIFICATION_SETTINGS.panelSize)

  return (
    <div className={ACCOUNT_NOTIFICATIONS.wrapper}>
      <div className={ACCOUNT_NOTIFICATIONS.head}>
        <p className={ACCOUNT_NOTIFICATIONS.heading}>{NOTIFICATION_COPY.title}</p>
        <Link
          href={ROUTES.notifications}
          onClick={onNavigate}
          className={ACCOUNT_NOTIFICATIONS.seeAll}
        >
          {NOTIFICATION_COPY.seeAll}
        </Link>
      </div>

      {feed.isLoading && entries.length === 0 && (
        <SkeletonList shape="row" rows={NOTIFICATION_SETTINGS.panelSize} />
      )}
      {!feed.isLoading && entries.length === 0 && (
        <p className={ACCOUNT_NOTIFICATIONS.empty}>{NOTIFICATION_COPY.emptyTitle}</p>
      )}
      {entries.length > 0 && <NotificationsList entries={entries} onOpen={feed.open} />}
    </div>
  )
}
