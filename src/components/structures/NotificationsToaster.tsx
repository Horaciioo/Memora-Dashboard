'use client'

import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import { TONE_BORDER, TONE_ICON, TONES } from '@/declarations/ui/theme'
import { TOAST_STYLES } from '@/declarations/ui/variants'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

/**
 * Toast title, its emphasis substring rendered bold
 * @param {string} title - Full sentence
 * @param {string} [emphasis] - Substring rendered bold
 * @return {JSX.Element}
 */

const ToastTitle = ({ title, emphasis }: { title: string; emphasis?: string }) => {
  const index = emphasis ? title.indexOf(emphasis) : -1
  if (!emphasis || index === -1) return <>{title}</>

  return (
    <>
      {title.slice(0, index)}
      <strong>{emphasis}</strong>
      {title.slice(index + emphasis.length)}
    </>
  )
}

/**
 * Renders the active toast stack, top right, one tone glyph per notification
 * @return {JSX.Element}
 */

export const NotificationsToaster = () => {
  const { notifications, dismiss, pause, resume } = useNotifications()
  const CloseIcon = ICONS.close

  return (
    <div className={TOAST_STYLES.stack} aria-live="polite">
      {notifications.map((notification) => {
        const tone = TONES[notification.tone]
        const ToneIcon = ICONS[TONE_ICON[notification.tone]]

        return (
          <div
            key={notification.id}
            onMouseEnter={() => pause(notification.id)}
            onMouseLeave={() => resume(notification.id)}
            className={cn(TOAST_STYLES.toast, TONE_BORDER[notification.tone])}
          >
            <span className={cn(TOAST_STYLES.badge, tone.soft, tone.text)}>
              <ToneIcon className={TOAST_STYLES.glyph} aria-hidden="true" />
            </span>
            <div className={TOAST_STYLES.body}>
              <p className={TOAST_STYLES.title}>
                <ToastTitle title={notification.title} emphasis={notification.emphasis} />
              </p>
              {notification.description && (
                <p className={TOAST_STYLES.description}>{notification.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(notification.id)}
              aria-label={ACTION_COPY.close}
              className={TOAST_STYLES.dismiss}
            >
              <CloseIcon className={TOAST_STYLES.glyph} aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
