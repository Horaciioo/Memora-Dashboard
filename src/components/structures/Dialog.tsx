'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ModalHeader } from '@/components/structures/ModalHeader'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { DIALOG_SIZES, DIALOG_STYLES, type DialogSize } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: DialogSize
  // Line rendered under the title
  subheader?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/**
 * Centred overlay trapping focus until it closes
 * @param {boolean} open - Overlay is mounted
 * @param {() => void} onClose - Dismiss handler
 * @param {string} title - Overlay title
 * @param {string} [description] - Screen reader only
 * @param {DialogSize} [size] - Panel width
 * @param {ReactNode} [subheader] - Line rendered under the title
 * @param {ReactNode} [footer] - Controls pinned to the bottom
 * @param {ReactNode} children - Overlay content
 * @return {JSX.Element | null}
 */

export const Dialog = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  subheader,
  footer,
  children,
}: DialogProps) => {
  const containerRef = useFocusTrap(open, onClose)
  const titleId = useId()
  const descriptionId = useId()
  useScrollLock(open)

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={DIALOG_STYLES.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(DIALOG_STYLES.panel, DIALOG_SIZES[size])}
      >
        <ModalHeader titleId={titleId} title={title} onClose={onClose} />
        {description && (
          <p id={descriptionId} className="sr-only">
            {description}
          </p>
        )}
        {subheader && <div className={DIALOG_STYLES.subheader}>{subheader}</div>}
        <div className={cn(DIALOG_STYLES.body, subheader && DIALOG_STYLES.bodyFlush)}>
          {children}
        </div>
        {footer && <div className={DIALOG_STYLES.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
