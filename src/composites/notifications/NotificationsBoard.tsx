'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Pagination } from '@/components/elements/navigation/Pagination'
import { Section } from '@/components/structures/page/Section'
import { NotificationsList } from '@/composites/notifications/NotificationsList'
import { useNotificationFeed } from '@/core/hooks/data/system/useNotificationFeed'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
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
  const { entries, unread, hasMore, open, readAll, remove, clearRead, loadMore, markUnread } =
    useNotificationFeed(feed)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [requestedPage, setRequestedPage] = useState(1)

  const matching = onlyUnread ? entries.filter((entry) => !entry.isRead) : entries
  const listSize = NOTIFICATION_SETTINGS.listSize
  // One page past the loaded rows while older ones wait on the server
  const loadedPages = Math.max(1, Math.ceil(matching.length / listSize))
  const totalPages = loadedPages + (hasMore ? 1 : 0)
  const page = Math.min(requestedPage, totalPages)
  const shown = matching.slice((page - 1) * listSize, page * listSize)

  // Reaching past the loaded rows fetches the next batch
  const goTo = (next: number) => {
    if (next > loadedPages && hasMore) loadMore()
    setRequestedPage(next)
  }

  const filter = (unreadOnly: boolean) => {
    setOnlyUnread(unreadOnly)
    setRequestedPage(1)
  }
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
              <Button variant={onlyUnread ? 'ghost' : 'secondary'} onClick={() => filter(false)}>
                {NOTIFICATION_COPY.filterAll}
              </Button>
              <Button variant={onlyUnread ? 'secondary' : 'ghost'} onClick={() => filter(true)}>
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
            <NotificationsList
              entries={shown}
              onOpen={open}
              onRemove={remove}
              onMarkUnread={markUnread}
            />
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={goTo} />
        </>
      )}
    </Section>
  )
}
