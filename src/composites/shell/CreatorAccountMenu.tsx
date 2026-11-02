'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { AccountActions } from '@/composites/shell/AccountActions'
import { AccountNotifications } from '@/composites/shell/AccountNotifications'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { CREATOR_MENU, RAIL_POPOVER } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { useNotificationsStore } from '@/core/store/notifications'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface CreatorAccountMenuProps {
  viewContext: ViewContext
  isCompact?: boolean
}

/**
 * Account footer of the rail, its box opening beside the rail with the account actions
 * and the latest notifications
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {boolean} [isCompact] - Rail is folded, only a small portrait shows
 * @return {JSX.Element | null}
 */

export const CreatorAccountMenu = ({ viewContext, isCompact }: CreatorAccountMenuProps) => {
  const { session } = useAuthContext()
  const [isOpen, setOpen] = useState(false)
  const boundary = useRef<HTMLDivElement>(null)
  const Chevron = ICONS.expand
  const unread = useNotificationsStore((state) => state.feed.unread)

  const shut = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, boundary, shut)

  // Escape closes
  useEffect(() => {
    if (!isOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') shut()
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, shut])

  if (!session) return null

  return (
    <div ref={boundary} className={CREATOR_MENU.wrapper}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setOpen((open) => !open)}
        title={isCompact ? session.displayName : undefined}
        className={cn(CREATOR_MENU.trigger, isCompact && CREATOR_MENU.triggerBare)}
      >
        <span className={CREATOR_MENU.portrait}>
          <Avatar
            name={session.displayName}
            src={session.avatarUrl}
            size={isCompact ? 'xs' : 'sm'}
          />
          {unread > 0 && <span className={CREATOR_MENU.dot} aria-hidden="true" />}
        </span>
        <span className={CREATOR_MENU.name}>{session.displayName}</span>
        <Chevron
          className={cn(
            CREATOR_MENU.chevron,
            isOpen ? CREATOR_MENU.chevronOpen : CREATOR_MENU.chevronShut
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div role="dialog" className={cn(RAIL_POPOVER.panel, RAIL_POPOVER.account)}>
          <div className={CREATOR_MENU.head}>
            <Avatar name={session.displayName} src={session.avatarUrl} size="md" />
            <p className={cn(RAIL_POPOVER.headTitle, 'truncate text-lg')}>{session.displayName}</p>
            <p className={RAIL_POPOVER.headMeta}>{ROLE_REGISTRY.label(session.role)}</p>
          </div>

          <div className={cn(RAIL_POPOVER.body, CREATOR_MENU.body)}>
            <AccountActions viewContext={viewContext} onNavigate={shut} />
            <span className={CREATOR_MENU.divider} aria-hidden="true" />
            <AccountNotifications onNavigate={shut} />
          </div>
        </div>
      )}
    </div>
  )
}
