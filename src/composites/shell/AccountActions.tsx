'use client'

import Link from '@/components/elements/navigation/AppLink'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { logout } from '@/app/connexion/actions'
import { ROUTES } from '@/declarations/navigation'
import { ACCOUNT_SHEET } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface AccountActionsProps {
  onNavigate: () => void
}

/**
 * Dark mode
 * @param {() => void} onNavigate - Close on leave
 * @return {JSX.Element}
 */

export const AccountActions = ({ onNavigate }: AccountActionsProps) => {
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
