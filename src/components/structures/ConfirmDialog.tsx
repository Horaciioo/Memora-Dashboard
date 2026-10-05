'use client'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { Tone } from '@/declarations/ui/theme'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  // Weight of the gesture
  tone?: Tone
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Two button overlay guarding a gesture that cannot be taken back
 * @param {boolean} open - Overlay is mounted
 * @param {string} title - What is about to happen
 * @param {string} description - Consequence of confirming
 * @param {string} [confirmLabel] - Accessible name of the confirming button
 * @param {Tone} [tone] - Weight of the gesture
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
  tone = 'danger',
  pending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const isDestructive = tone === 'danger'

  const confirmName = pending
    ? isDestructive
      ? ACTION_COPY.deleting
      : ACTION_COPY.saving
    : (confirmLabel ?? ACTION_COPY.confirm)

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="xs"
      footer={
        <>
          <Button onClick={onCancel} disabled={pending}>
            {ACTION_COPY.cancel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={pending}
          >
            {confirmName}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--color-ink-subtle)]">{description}</p>
    </Dialog>
  )
}
