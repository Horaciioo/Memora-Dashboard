'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { useNotificationFeed } from '@/core/hooks/data/useNotificationFeed'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { RAIL_POPOVER } from '@/declarations/ui/blocks'
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
  iconClassName?: string
}

/**
 * Bell of the rail, its box opening beside the rail, its dot resolved server-side so it is
 * right on first paint
 * @param {number} initialUnread - Unopened count resolved server-side
 * @param {string} [iconClassName] - Classes overriding the standard glyph size
 * @return {JSX.Element}
 */

export const NotificationsBell = ({ initialUnread, iconClassName }: NotificationsBellProps) => {
  const feed = useNotificationFeed(
    { entries: [], unread: initialUnread },
    NOTIFICATION_SETTINGS.panelSize
  )
  const [isOpen, setOpen] = useState(false)
  const BellIcon = ICONS.bell

  const close = () => setOpen(false)

  // Escape closes
  useEffect(() => {
    if (!isOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

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
        type="button"
        aria-label={isOpen ? NOTIFICATION_COPY.close : NOTIFICATION_COPY.open}
        aria-expanded={isOpen}
        title={NOTIFICATION_COPY.title}
        onClick={toggle}
        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.icon, NOTIFICATION_STYLES.trigger)}
      >
        <BellIcon className={iconClassName ?? 'h-4 w-4 shrink-0'} aria-hidden="true" />
        {feed.unread > 0 && <span className={NOTIFICATION_STYLES.pastille} aria-hidden="true" />}
      </button>

      {isOpen && (
        <>
          <div className={RAIL_POPOVER.scrim} role="presentation" onMouseDown={close} />
          <NotificationsPanel
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
