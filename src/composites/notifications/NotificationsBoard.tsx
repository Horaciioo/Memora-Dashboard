'use client'

import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/Section'
import { NotificationsList } from '@/composites/notifications/NotificationsList'
import { useNotificationFeed } from '@/core/hooks/data/useNotificationFeed'
import { ROUTES } from '@/declarations/navigation'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { NotificationFeed } from '@/types/notifications'

export interface NotificationsBoardProps {
  feed: NotificationFeed
}

/**
 * Full listing of what reached the signed-in member, hydrated from the server render so the
 * page never refetches what it already holds
 * @param {NotificationFeed} feed - Feed resolved server-side
 * @return {JSX.Element}
 */

export const NotificationsBoard = ({ feed }: NotificationsBoardProps) => {
  const { entries, unread, open, readAll } = useNotificationFeed(feed)

  return (
    <Section
      action={
        unread > 0 && (
          <Button variant="ghost" icon="confirm" onClick={readAll}>
            {NOTIFICATION_COPY.markAll}
          </Button>
        )
      }
      bare={entries.length === 0}
    >
      {entries.length === 0 ? (
        <EmptyState
          figure="notifications"
          title={NOTIFICATION_COPY.emptyTitle}
          description={NOTIFICATION_COPY.emptyDescription}
          action={
            <Link
              href={ROUTES.dashboard}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}
            >
              {NOTIFICATION_COPY.backHome}
            </Link>
          }
        />
      ) : (
        <NotificationsList entries={entries} onOpen={open} />
      )}
    </Section>
  )
}
