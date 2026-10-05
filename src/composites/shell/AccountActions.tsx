'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { logout } from '@/app/connexion/actions'
import { ROUTES } from '@/declarations/navigation'
import { ACCOUNT_SHEET } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { ICONS } from '@/declarations/ui/icons'
import { ViewToggle } from '@/composites/shell/ViewToggle'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface AccountActionsProps {
  unreadCount: number
  onNavigate: () => void
  // Lightning takes the bell's slot
  viewContext?: ViewContext
}

/**
 * Dark mode
 * @param {number} unreadCount - Unopened notifications
 * @param {() => void} onNavigate - Close on leave
 * @param {ViewContext} [viewContext] - Swaps the bell for the lightning
 * @return {JSX.Element}
 */

export const AccountActions = ({ unreadCount, onNavigate, viewContext }: AccountActionsProps) => {
  const BellIcon = ICONS.bell
  const SettingsIcon = ICONS.settings
  const SignOutIcon = ICONS.signOut

  return (
    <div className={ACCOUNT_SHEET.stack}>
      <div className={ACCOUNT_SHEET.row}>
        <span className={ACCOUNT_SHEET.label}>{NAV_COPY.theme}</span>
        <ThemeToggle />
      </div>

      <span className={ACCOUNT_SHEET.divider} />

      <div className={ACCOUNT_SHEET.iconRow}>
        {viewContext?.switchable ? (
          <ViewToggle
            viewContext={viewContext}
            className={cn(ACCOUNT_SHEET.iconButton, ACCOUNT_SHEET.iconIdle)}
            iconClassName={ACCOUNT_SHEET.icon}
          />
        ) : (
          <Link
            href={ROUTES.notifications}
            onClick={onNavigate}
            aria-label={NOTIFICATION_COPY.title}
            className={cn(ACCOUNT_SHEET.iconButton, ACCOUNT_SHEET.iconIdle, 'relative')}
          >
            <BellIcon className={ACCOUNT_SHEET.icon} aria-hidden="true" />
            {unreadCount > 0 && <span className={ACCOUNT_SHEET.dot} aria-hidden="true" />}
          </Link>
        )}

        <span className={ACCOUNT_SHEET.iconDivider} aria-hidden="true" />

        <Link
          href={ROUTES.preferences}
          onClick={onNavigate}
          aria-label={NAV_COPY.preferences}
          className={cn(ACCOUNT_SHEET.iconButton, ACCOUNT_SHEET.iconIdle)}
        >
          <SettingsIcon className={ACCOUNT_SHEET.icon} aria-hidden="true" />
        </Link>

        <span className={ACCOUNT_SHEET.iconDivider} aria-hidden="true" />

        <form action={logout} className={ACCOUNT_SHEET.signOutForm}>
          <button
            type="submit"
            aria-label={AUTH_COPY.signOut}
            className={cn(ACCOUNT_SHEET.iconButton, ACCOUNT_SHEET.iconButtonDanger)}
          >
            <SignOutIcon className={ACCOUNT_SHEET.icon} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  )
}
