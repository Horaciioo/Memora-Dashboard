'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { DERANK_COPY } from '@/declarations/academy/derank'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DERANK_PICKER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { withToggled } from '@/utils/format/arrays'

export interface DerankOption {
  id: string
  name: string
  avatarUrl?: string | null
}

export interface DerankPickerProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  // Fewest people the gesture needs
  minimum: number
  options: DerankOption[]
  // Ticked when the dialog opens
  initial?: string[]
  pending?: boolean
  onClose: () => void
  onConfirm: (ids: string[]) => void | Promise<void>
}

/**
 * Pick several people for one gesture
 * @param {DerankPickerProps} props - Options and handlers
 * @return {JSX.Element}
 */

export const DerankPicker = ({
  open,
  title,
  description,
  confirmLabel,
  minimum,
  options,
  initial = [],
  pending,
  onClose,
  onConfirm,
}: DerankPickerProps) => {
  const [picked, setPicked] = useState<Set<string>>(new Set(initial))
  const MarkIcon = ICONS.confirm

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
      footer={
        <>
          <Button onClick={onClose}>{ACTION_COPY.cancel}</Button>
          <Button
            variant="primary"
            disabled={picked.size < minimum || pending}
            onClick={() => void onConfirm([...picked])}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {options.length === 0 ? (
        <p>{DERANK_COPY.empty}</p>
      ) : (
        <div className={DERANK_PICKER.list}>
          {options.map((option) => {
            const isOn = picked.has(option.id)

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => setPicked((current) => withToggled(current, option.id))}
                className={cn(DERANK_PICKER.row, isOn && DERANK_PICKER.rowOn)}
              >
                <Avatar name={option.name} src={option.avatarUrl} size="sm" />
                <span className={DERANK_PICKER.name}>{option.name}</span>
                {isOn && <MarkIcon className={DERANK_PICKER.mark} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </Dialog>
  )
}
