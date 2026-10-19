'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Textarea } from '@/components/elements/forms/inputs/Textarea'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { MODVIEW_WARN } from '@/declarations/ui/variants'

export interface WarnDialogProps {
  // Who is warned, said under the title
  name: string
  onConfirm: (reason: string) => void
  onClose: () => void
}

/**
 * Asks the reason of a warning before it goes out
 * @param {string} name - Viewer warned
 * @param {(reason: string) => void} onConfirm - Reason written
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const WarnDialog = ({ name, onConfirm, onClose }: WarnDialogProps) => {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()

  const confirm = () => {
    if (!trimmed) return
    onConfirm(trimmed)
    onClose()
  }

  return (
    <Dialog
      open
      size="sm"
      title={MODVIEW_COPY.warnTitle}
      description={MODVIEW_COPY.warnLead.replace('{name}', name)}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{ACTION_COPY.cancel}</Button>
          <Button variant="primary" disabled={!trimmed} onClick={confirm}>
            {MODVIEW_COPY.warnConfirm}
          </Button>
        </>
      }
    >
      <Textarea
        autoFocus
        className={MODVIEW_WARN.field}
        placeholder={MODVIEW_COPY.warnPlaceholder}
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
    </Dialog>
  )
}
