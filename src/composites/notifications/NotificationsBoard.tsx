'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/Section'
import { NotificationsList } from '@/composites/notifications/NotificationsList'
import { useNotificationFeed } from '@/core/hooks/data/useNotificationFeed'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { NOTIFICATION_STYLES } from '@/declarations/ui/variants'
import type { NotificationFeed } from '@/types/notifications'

export interface NotificationsBoardProps {
  feed: NotificationFeed
}

/**
 * Full listing of what reached the signed-in member
 * @param {NotificationFeed} feed - Feed resolved server-side
 * @return {JSX.Element}
 */

export const NotificationsBoard = ({ feed }: NotificationsBoardProps) => {
  const { entries, unread, hasMore, open, readAll, remove, clearRead, loadMore } =
    useNotificationFeed(feed)
  const [onlyUnread, setOnlyUnread] = useState(false)

  const shown = onlyUnread ? entries.filter((entry) => !entry.isRead) : entries
  const hasRead = entries.some((entry) => entry.isRead)

  return (
    <Section bare={entries.length === 0} padded={entries.length > 0}>
      {entries.length === 0 ? (
        <EmptyState
          figure="notifications"
          title={NOTIFICATION_COPY.emptyTitle}
          description={NOTIFICATION_COPY.emptyDescription}
          action={<span />}
        />
      ) : (
        <>
          <div className={NOTIFICATION_STYLES.tools}>
            <div className={NOTIFICATION_STYLES.filters}>
              <Button
                variant={onlyUnread ? 'ghost' : 'secondary'}
                onClick={() => setOnlyUnread(false)}
              >
                {NOTIFICATION_COPY.filterAll}
              </Button>
              <Button
                variant={onlyUnread ? 'secondary' : 'ghost'}
                onClick={() => setOnlyUnread(true)}
              >
                {NOTIFICATION_COPY.filterUnread}
              </Button>
            </div>
            <div className={NOTIFICATION_STYLES.filters}>
              {unread > 0 && (
                <Button variant="ghost" icon="confirm" onClick={readAll}>
                  {NOTIFICATION_COPY.markAll}
                </Button>
              )}
              {hasRead && (
                <Button variant="ghost" icon="close" onClick={clearRead}>
                  {NOTIFICATION_COPY.clearRead}
                </Button>
              )}
            </div>
          </div>

          {shown.length === 0 ? (
            <EmptyState
              compact
              figure="notifications"
              title={NOTIFICATION_COPY.unreadEmptyTitle}
              description={NOTIFICATION_COPY.unreadEmptyDescription}
              action={<span />}
            />
          ) : (
            <NotificationsList entries={shown} onOpen={open} onRemove={remove} />
          )}

          {hasMore && (
            <div className={NOTIFICATION_STYLES.more}>
              <Button variant="secondary" onClick={loadMore}>
                {NOTIFICATION_COPY.loadMore}
              </Button>
            </div>
          )}
        </>
      )}
    </Section>
  )
}
