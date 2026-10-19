'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'

export interface EraseYoutuberDialogProps {
  name: string
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

/**
 * Last guard before a creator and all their data go: their name has to be typed
 * @param {string} name - Creator
 * @param {boolean} isPending - Erasure running
 * @param {() => void} onConfirm - Confirm handler
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const EraseYoutuberDialog = ({
  name,
  isPending,
  onConfirm,
  onClose,
}: EraseYoutuberDialogProps) => {
  const [typed, setTyped] = useState('')
  const isMatching = typed.trim().toLowerCase() === name.trim().toLowerCase()

  return (
    <Dialog
      open
      size="sm"
      title={REFERENCE_COPY.eraseTitle.replace('{name}', name)}
      description={REFERENCE_COPY.eraseBody}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={isPending}>
            {ACTION_COPY.cancel}
          </Button>
          <Button variant="danger" isLoading={isPending} disabled={!isMatching} onClick={onConfirm}>
            {REFERENCE_COPY.eraseConfirm}
          </Button>
        </>
      }
    >
      <p>{REFERENCE_COPY.eraseBody}</p>
      <Input
        autoFocus
        aria-label={REFERENCE_COPY.eraseType.replace('{name}', name)}
        placeholder={REFERENCE_COPY.eraseType.replace('{name}', name)}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
      />
    </Dialog>
  )
}
