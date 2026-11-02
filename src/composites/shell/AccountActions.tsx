'use client'

import Link from '@/components/elements/navigation/AppLink'
import { ThemeCycle } from '@/components/elements/actions/ThemeCycle'
import { logout } from '@/app/connexion/actions'
import { RoleSwitch } from '@/composites/shell/RoleSwitch'
import { ROUTES } from '@/declarations/navigation'
import { ACCOUNT_SHEET } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { ICONS } from '@/declarations/ui/icons'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface AccountActionsProps {
  viewContext: ViewContext
  onNavigate: () => void
}

/**
 * View switch, then settings, theme and sign out on one row
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {() => void} onNavigate - Close on leave
 * @return {JSX.Element}
 */

export const AccountActions = ({ viewContext, onNavigate }: AccountActionsProps) => {
  const SettingsIcon = ICONS.settings
  const SignOutIcon = ICONS.signOut

  return (
    <div className={ACCOUNT_SHEET.stack}>
      {viewContext.switchable && (
        <>
          <RoleSwitch viewContext={viewContext} />
          <span className={ACCOUNT_SHEET.switchRule} />
        </>
      )}

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

        <ThemeCycle
          className={cn(ACCOUNT_SHEET.iconButton, ACCOUNT_SHEET.iconIdle)}
          iconClassName={ACCOUNT_SHEET.icon}
        />

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
