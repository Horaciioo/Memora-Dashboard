'use client'

import { createPortal } from 'react-dom'

import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_HUB, PLAY_LEAVE_UI } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayLeaveDialogProps {
  title: string
  text: string
  confirm: string
  pending: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Give up or end question in the arcade look
 * @param {PlayLeaveDialogProps} props - Copy, pending flag and handlers
 * @return {JSX.Element}
 */

export const PlayLeaveDialog = ({
  title,
  text,
  confirm,
  pending,
  onCancel,
  onConfirm,
}: PlayLeaveDialogProps) => {
  const trapRef = useFocusTrap(true, onCancel)
  // Inside the stage so the browser full screen keeps showing it
  const host = document.querySelector('[data-play-stage]') ?? document.body

  return createPortal(
    <div className={cn(PLAY_HUB.sheet, 'z-[60]')}>
      <div className={PLAY_HUB.sheetScrim} onMouseDown={onCancel} />
      <div
        ref={trapRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className={cn(PLAY_HUB.sheetWindow, PLAY_LEAVE_UI.window)}
      >
        <h2 className={PLAY_LEAVE_UI.title}>{title}</h2>
        <p className={PLAY_LEAVE_UI.text}>{text}</p>
        <div className={PLAY_LEAVE_UI.keys}>
          <Button
            variant="arcadeGhost"
            className={PLAY_LEAVE_UI.key}
            onClick={onCancel}
            disabled={pending}
          >
            {PLAY_MOBILE_COPY.gameLeaveKeep}
          </Button>
          <Button
            variant="arcadeDanger"
            className={PLAY_LEAVE_UI.key}
            isLoading={pending}
            onClick={onConfirm}
          >
            {confirm}
          </Button>
        </div>
      </div>
    </div>,
    host
  )
}
