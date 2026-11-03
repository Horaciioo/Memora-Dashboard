'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Textarea } from '@/components/elements/forms/inputs/Textarea'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { MODVIEW_WARN } from '@/declarations/ui/variants'

export interface ReasonDialogProps {
  // Says who is sanctioned and how
  description: string
  placeholder: string
  confirmLabel: string
  // A blank reason blocks the confirm
  isRequired?: boolean
  // Extra check from the fields in children
  canConfirm?: boolean
  // Fields above the reason
  children?: ReactNode
  onConfirm: (reason: string) => void
  onClose: () => void
}

/**
 * Asks the reason of a sanction before it goes out
 * @param {ReasonDialogProps} props - Dialog props
 * @return {JSX.Element}
 */

export const ReasonDialog = ({
  description,
  placeholder,
  confirmLabel,
  isRequired = true,
  canConfirm = true,
  children,
  onConfirm,
  onClose,
}: ReasonDialogProps) => {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const ready = canConfirm && (!isRequired || trimmed !== '')

  const confirm = () => {
    if (!ready) return
    onConfirm(trimmed)
    onClose()
  }

  return (
    <Dialog
      open
      size="sm"
      title={MODVIEW_COPY.warnTitle}
      description={description}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{ACTION_COPY.cancel}</Button>
          <Button variant="primary" disabled={!ready} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className={MODVIEW_WARN.body}>
        {children}
        <Textarea
          autoFocus
          className={MODVIEW_WARN.field}
          placeholder={placeholder}
          aria-label={MODVIEW_COPY.warnTitle}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter breaks the line
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              confirm()
            }
          }}
        />
      </div>
    </Dialog>
  )
}
