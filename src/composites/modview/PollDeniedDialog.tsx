'use client'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { MODVIEW_POLL_COPY } from '@/declarations/modview/copy'
import { MODVIEW_POLL } from '@/declarations/ui/variants'

export interface PollDeniedDialogProps {
  onClose: () => void
}

/**
 * Said to a seat that may not launch a poll
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const PollDeniedDialog = ({ onClose }: PollDeniedDialogProps) => (
  <Dialog
    open
    onClose={onClose}
    title={MODVIEW_POLL_COPY.deniedTitle}
    size="sm"
    footer={
      <Button variant="primary" onClick={onClose}>
        {MODVIEW_POLL_COPY.deniedClose}
      </Button>
    }
  >
    <p className={MODVIEW_POLL.denied}>{MODVIEW_POLL_COPY.denied}</p>
  </Dialog>
)
