'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { Dialog } from '@/components/structures/Dialog'
import { logout } from '@/app/connexion/actions'
import { ROUTES } from '@/declarations/navigation'
import { ACCOUNT_SHEET } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface AccountSheetProps {
  open: boolean
  unreadCount: number
  onClose: () => void
}

/**
 * Dark mode, then a row of glyph-only actions — notifications, settings, sign out
 * @param {boolean} open - Sheet is mounted
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const AccountSheet = ({ open, unreadCount, onClose }: AccountSheetProps) => {
  const BellIcon = ICONS.bell
  const SettingsIcon = ICONS.settings
  const SignOutIcon = ICONS.signOut

  return (
    <Dialog open={open} onClose={onClose} title={NAV_COPY.account} size="sm">
      <div className={ACCOUNT_SHEET.stack}>
        <div className={ACCOUNT_SHEET.row}>
          <span className={ACCOUNT_SHEET.label}>{NAV_COPY.theme}</span>
          <ThemeToggle />
        </div>

        <span className={ACCOUNT_SHEET.divider} />

        <div className={ACCOUNT_SHEET.iconRow}>
          <Link
            href={ROUTES.notifications}
            onClick={onClose}
            aria-label={NOTIFICATION_COPY.title}
            className={cn(ACCOUNT_SHEET.iconButton, 'relative')}
          >
            <BellIcon className={ACCOUNT_SHEET.icon} aria-hidden="true" />
            {unreadCount > 0 && <span className={ACCOUNT_SHEET.dot} aria-hidden="true" />}
          </Link>

          <span className={ACCOUNT_SHEET.iconDivider} aria-hidden="true" />

          <Link
            href={ROUTES.preferences}
            onClick={onClose}
            aria-label={NAV_COPY.preferences}
            className={ACCOUNT_SHEET.iconButton}
          >
            <SettingsIcon className={ACCOUNT_SHEET.icon} aria-hidden="true" />
          </Link>

          <span className={ACCOUNT_SHEET.iconDivider} aria-hidden="true" />

          <form action={logout} className="flex flex-1">
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
    </Dialog>
  )
}
