'use client'

import { Dialog } from '@/components/structures/overlays/Dialog'
import { AccountActions } from '@/composites/shell/AccountActions'
import { CreatorPicker } from '@/composites/shell/CreatorPicker'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import type { ViewContext } from '@/types/access'

export interface AccountSheetProps {
  open: boolean
  viewContext: ViewContext
  onClose: () => void
}

/**
 * Account actions in a dialog, the creator on screen on top
 * @param {boolean} open - Sheet is mounted
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const AccountSheet = ({ open, viewContext, onClose }: AccountSheetProps) => (
  <Dialog open={open} onClose={onClose} title={NAV_COPY.account} size="sm">
    {viewContext.creators.length > 0 && (
      <CreatorPicker
        creators={viewContext.creators}
        activeYoutuberId={viewContext.activeYoutuberId}
        labelled
        onPicked={onClose}
      />
    )}
    <AccountActions onNavigate={onClose} />
  </Dialog>
)
