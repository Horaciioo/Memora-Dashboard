'use client'

import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { PlayInvitePicker } from '@/composites/play/session/PlayInvitePicker'
import type { PlayInvitePickerProps } from '@/composites/play/session/PlayInvitePicker'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { PLAY_INVITE } from '@/declarations/ui/variants'

export interface PlayInviteAnchorProps extends Omit<PlayInvitePickerProps, 'onDone'> {
  // Trigger, told how to open the picker
  trigger: (toggle: () => void, isOpen: boolean) => ReactNode
}

/**
 * Any trigger opening the invite picker under it
 * @param {PlayInviteAnchorProps} props - Trigger and picker props
 * @return {JSX.Element}
 */

export const PlayInviteAnchor = ({ trigger, inline, ...picker }: PlayInviteAnchorProps) => {
  const [isOpen, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, box, close)

  return (
    <div ref={box} className={inline ? PLAY_INVITE.anchorInline : PLAY_INVITE.anchor}>
      {trigger(() => setOpen((current) => !current), isOpen)}
      {isOpen && <PlayInvitePicker {...picker} inline={inline} onDone={close} />}
    </div>
  )
}
