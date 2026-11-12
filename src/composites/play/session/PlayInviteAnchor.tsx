'use client'

import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { PlayInvitePicker } from '@/composites/play/session/PlayInvitePicker'
import type { PlayInvitePickerProps } from '@/composites/play/session/PlayInvitePicker'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { PLAY_INVITE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayInviteAnchorProps extends Omit<PlayInvitePickerProps, 'onDone'> {
  // Trigger, told how to open the picker
  trigger: (toggle: () => void, isOpen: boolean) => ReactNode
  // Picker already open on arrival
  isOpenAtStart?: boolean
  // Extra classes of the wrapper
  className?: string
}

/**
 * Any trigger opening the invite picker under it
 * @param {PlayInviteAnchorProps} props - Trigger and picker props
 * @return {JSX.Element}
 */

export const PlayInviteAnchor = ({
  trigger,
  inline,
  isOpenAtStart = false,
  className,
  ...picker
}: PlayInviteAnchorProps) => {
  const [isOpen, setOpen] = useState(isOpenAtStart)
  const box = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, box, close, '[role="alertdialog"]')

  return (
    <div
      ref={box}
      className={cn(
        inline || picker.above ? PLAY_INVITE.anchorInline : PLAY_INVITE.anchor,
        className
      )}
    >
      {trigger(() => setOpen((current) => !current), isOpen)}
      {isOpen && <PlayInvitePicker {...picker} inline={inline} onDone={close} />}
    </div>
  )
}
