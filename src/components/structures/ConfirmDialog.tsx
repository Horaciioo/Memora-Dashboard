'use client'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { ACTION_COPY } from '@/declarations/ui/copy'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Two button overlay guarding a destructive gesture
 * @param {boolean} open - Overlay is mounted
 * @param {string} title - What is about to happen
 * @param {string} description - Consequence of confirming
 * @param {string} [confirmLabel] - Label of the confirming button
 * @param {boolean} [pending] - Blocks both buttons while the action runs
 * @param {() => void} onConfirm - Confirm handler
 * @param {() => void} onCancel - Dismiss handler
 * @return {JSX.Element}
 */

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={onCancel}
    title={title}
    description={description}
    footer={
      <>
        <Button onClick={onCancel} disabled={pending}>
          {ACTION_COPY.cancel}
        </Button>
        <Button variant="danger" icon="remove" onClick={onConfirm} disabled={pending}>
          {pending ? ACTION_COPY.deleting : (confirmLabel ?? ACTION_COPY.confirm)}
        </Button>
      </>
    }
  >
    <p className="text-sm text-[var(--color-ink-subtle)]">{description}</p>
  </Dialog>
)
