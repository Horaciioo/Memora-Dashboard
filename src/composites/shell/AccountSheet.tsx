'use client'

import { Dialog } from '@/components/structures/Dialog'
import { AccountActions } from '@/composites/shell/AccountActions'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'

export interface AccountSheetProps {
  open: boolean
  onClose: () => void
}

/**
 * Account actions in a dialog
 * @param {boolean} open - Sheet is mounted
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const AccountSheet = ({ open, onClose }: AccountSheetProps) => (
  <Dialog open={open} onClose={onClose} title={NAV_COPY.account} size="sm">
    <AccountActions onNavigate={onClose} />
  </Dialog>
)
