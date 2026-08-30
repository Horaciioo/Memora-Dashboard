import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { NotificationsBoard } from '@/composites/notifications/NotificationsBoard'
import { readNotifications } from '@/core/services/system/NotificationService'
import { requireUser } from '@/core/wrappers/requireUser'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: NOTIFICATION_COPY.title }

/**
 * Everything that reached the signed-in member
 * @return {Promise<JSX.Element>} - Notifications page
 */

export default async function NotificationsPage() {
  const { session } = await requireUser()
  const feed = await readNotifications(session.id)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={NOTIFICATION_COPY.title} />
      <NotificationsBoard feed={feed} />
    </div>
  )
}
