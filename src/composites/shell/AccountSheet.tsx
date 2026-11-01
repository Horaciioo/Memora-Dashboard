'use client'

import Link from '@/components/elements/navigation/AppLink'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { logout } from '@/app/connexion/actions'
import { CreatorPicker } from '@/composites/shell/CreatorPicker'
import { ROUTES } from '@/declarations/navigation'
import { ACCOUNT_SHEET } from '@/declarations/ui/blocks'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BOTTOM_SHEET } from '@/declarations/ui/variants'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface AccountSheetProps {
  open: boolean
  viewContext: ViewContext
  // Name on the sheet title line
  displayName: string
  onClose: () => void
}

/**
 * Account sheet rising from the bottom: creator on screen, theme, settings and sign out, all centred
 * @param {boolean} open - Sheet is mounted
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {string} displayName - Member name
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const AccountSheet = ({ open, viewContext, displayName, onClose }: AccountSheetProps) => {
  const SettingsIcon = ICONS.settings
  const SignOutIcon = ICONS.signOut

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={NAV_COPY.account}
      figure={
        <>
          <h2 className={BOTTOM_SHEET.figureTitle} aria-hidden="true">
            {NAV_COPY.account}
          </h2>
          <p className={BOTTOM_SHEET.figureLine}>{displayName}</p>
        </>
      }
    >
      <div className={ACCOUNT_SHEET.sheet}>
        {viewContext.creators.length > 0 && (
          <CreatorPicker
            creators={viewContext.creators}
            activeYoutuberId={viewContext.activeYoutuberId}
            labelled
            isCentered
            onPicked={onClose}
          />
        )}

        <div className={ACCOUNT_SHEET.sheetBlock}>
          <span className={ACCOUNT_SHEET.sheetLabel}>{NAV_COPY.theme}</span>
          <ThemeToggle isFull />
        </div>

        <div className={ACCOUNT_SHEET.sheetActions}>
          <Link href={ROUTES.preferences} onClick={onClose} className={ACCOUNT_SHEET.sheetAction}>
            <SettingsIcon className={ACCOUNT_SHEET.sheetActionIcon} aria-hidden="true" />
            {NAV_COPY.preferences}
          </Link>
          <form action={logout} className="flex">
            <button
              type="submit"
              className={cn(ACCOUNT_SHEET.sheetAction, ACCOUNT_SHEET.sheetActionDanger, 'w-full')}
            >
              <SignOutIcon className={ACCOUNT_SHEET.sheetActionIcon} aria-hidden="true" />
              {AUTH_COPY.signOut}
            </button>
          </form>
        </div>
      </div>
    </BottomSheet>
  )
}
