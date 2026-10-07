import { NotificationItem } from '@/composites/notifications/NotificationItem'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_STYLES } from '@/declarations/ui/variants'
import type { NotificationEntry } from '@/types/notifications'

export interface NotificationsListProps {
  entries: NotificationEntry[]
  onOpen: (id: string) => void
  onRemove?: (id: string) => void
}

/**
 * Stack of notifications separated by an inset rule
 * @param {NotificationEntry[]} entries - Notifications
 * @param {(id: string) => void} onOpen - Called once a row is settled
 * @param {(id: string) => void} [onRemove] - Dismisses a row
 * @return {JSX.Element}
 */

export const NotificationsList = ({ entries, onOpen, onRemove }: NotificationsListProps) => (
  <div className={NOTIFICATION_STYLES.list}>
    {entries.map((entry, index) => (
      <div key={entry.id}>
        <NotificationItem
          entry={entry}
          withAction={index < NOTIFICATION_SETTINGS.maxActions}
          onOpen={onOpen}
          onRemove={onRemove}
        />
        {index < entries.length - 1 && (
          <span className={NOTIFICATION_STYLES.divider} aria-hidden="true" />
        )}
      </div>
    ))}
  </div>
)
