'use client'

import { useRef, useState } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayActivityLine } from '@/composites/play/topbar/PlayActivityLine'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import { usePlayActivities } from '@/core/hooks/data/play/usePlayActivities'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_ACTIVITY_COPY, PLAY_HOME_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ACTIVITY, PLAY_TOPBAR } from '@/declarations/ui/variants'

/**
 * Right end of the top bar: personal events and personal settings
 * @return {JSX.Element}
 */

export const PlayActivityKeys = () => {
  const [isOpen, setOpen] = useState(false)
  const boundary = useRef<HTMLDivElement>(null)
  const { entries, unread, markRead } = usePlayActivities()
  useOutsideDismiss(isOpen, boundary, () => setOpen(false))
  const BellIcon = ICONS.bell
  const SettingsIcon = ICONS.settings

  const toggle = () => {
    if (!isOpen && unread > 0) markRead()
    setOpen((open) => !open)
  }

  return (
    <div className={PLAY_ACTIVITY.keys}>
      <div ref={boundary} className={PLAY_ACTIVITY.host}>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={PLAY_HOME_COPY.bell}
          title={PLAY_HOME_COPY.bell}
          className={PLAY_TOPBAR.go}
          onClick={toggle}
        >
          <BellIcon className={PLAY_TOPBAR.goIcon} aria-hidden="true" />
          {unread > 0 && !isOpen && <span className={PLAY_ACTIVITY.badge} aria-hidden="true" />}
        </button>
        {isOpen && (
          <div role="dialog" aria-label={PLAY_ACTIVITY_COPY.title} className={PLAY_ACTIVITY.panel}>
            <p className={PLAY_ACTIVITY.title}>{PLAY_ACTIVITY_COPY.title}</p>
            {entries.length === 0 ? (
              <PlayEmpty isCompact>{PLAY_ACTIVITY_COPY.empty}</PlayEmpty>
            ) : (
              <ul className={PLAY_ACTIVITY.list}>
                {entries.map((entry) => (
                  <PlayActivityLine key={entry.id} entry={entry} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <AppLink
        href={ROUTES.playSettings}
        aria-label={PLAY_HOME_COPY.settings}
        title={PLAY_HOME_COPY.settings}
        className={PLAY_TOPBAR.go}
      >
        <SettingsIcon className={PLAY_TOPBAR.goIcon} aria-hidden="true" />
      </AppLink>
    </div>
  )
}
