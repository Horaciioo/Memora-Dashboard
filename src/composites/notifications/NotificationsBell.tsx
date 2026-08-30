'use client'

import dynamic from 'next/dynamic'

import { useNotificationFeed } from '@/core/hooks/data/useNotificationFeed'
import { useAnchoredPanel } from '@/core/hooks/interaction/useAnchoredPanel'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, NOTIFICATION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Window built only once the bell is first rung, kept out of the shell bundle
const NotificationsPanel = dynamic(
  () =>
    import('@/composites/notifications/NotificationsPanel').then((mod) => mod.NotificationsPanel),
  { ssr: false }
)

export interface NotificationsBellProps {
  initialUnread: number
}

/**
 * Bell of the rail, its pastille resolved server-side so the badge is right on first paint
 * and the page itself only travels once the window opens
 * @param {number} initialUnread - Unopened count resolved server-side
 * @return {JSX.Element}
 */

export const NotificationsBell = ({ initialUnread }: NotificationsBellProps) => {
  const feed = useNotificationFeed(
    { entries: [], unread: initialUnread },
    NOTIFICATION_SETTINGS.panelSize
  )
  const { isOpen, close, setOpen, triggerRef, panelRef } = useAnchoredPanel()
  const BellIcon = ICONS.bell

  const toggle = () => {
    if (isOpen) {
      close()
      return
    }

    feed.load()
    setOpen(true)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? NOTIFICATION_COPY.close : NOTIFICATION_COPY.open}
        aria-expanded={isOpen}
        title={NOTIFICATION_COPY.title}
        onClick={toggle}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.icon, NOTIFICATION_STYLES.trigger)}
      >
        <BellIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {feed.unread > 0 && <span className={NOTIFICATION_STYLES.pastille}>{feed.unread}</span>}
      </button>

      {isOpen && (
        <>
          <div className={NOTIFICATION_STYLES.scrim} role="presentation" onMouseDown={close} />
          <NotificationsPanel
            panelRef={panelRef}
            entries={feed.entries}
            unread={feed.unread}
            isLoading={feed.isLoading}
            onOpen={feed.open}
            onReadAll={feed.readAll}
            onLeave={close}
          />
        </>
      )}
    </>
  )
}
