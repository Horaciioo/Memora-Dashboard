'use client'

import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import { TONE_BORDER } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

/**
 * Renders the active toast stack
 * @return {JSX.Element}
 */

export const NotificationsToaster = () => {
  const { notifications, dismiss, pause, resume } = useNotifications()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onMouseEnter={() => pause(notification.id)}
          onMouseLeave={() => resume(notification.id)}
          className={cn(
            'flex items-start justify-between gap-3 rounded-[var(--radius-md)] border bg-[var(--color-surface-raised)] px-4 py-2 text-sm shadow-lg',
            TONE_BORDER[notification.tone]
          )}
        >
          <div>
            <p className="font-medium">{notification.title}</p>
            {notification.description && (
              <p className="text-[var(--color-ink-subtle)]">{notification.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(notification.id)}
            aria-label="Dismiss"
            className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
