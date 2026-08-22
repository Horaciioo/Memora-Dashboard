'use client'

import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import { TONE_BORDER } from '@/declarations/ui/theme'
import { TOAST_STYLES } from '@/declarations/ui/variants'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

/**
 * Renders the active toast stack
 * @return {JSX.Element}
 */

export const NotificationsToaster = () => {
  const { notifications, dismiss, pause, resume } = useNotifications()
  const CloseIcon = ICONS.close

  return (
    <div className={TOAST_STYLES.stack} aria-live="polite">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onMouseEnter={() => pause(notification.id)}
          onMouseLeave={() => resume(notification.id)}
          className={cn(TOAST_STYLES.toast, TONE_BORDER[notification.tone])}
        >
          <div className="min-w-0">
            <p className="font-medium">{notification.title}</p>
            {notification.description && (
              <p className="text-[var(--color-ink-subtle)]">{notification.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(notification.id)}
            aria-label={ACTION_COPY.close}
            className={TOAST_STYLES.dismiss}
          >
            <CloseIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
