'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { DIALOG_SIZES, DIALOG_STYLES, type DialogSize } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: DialogSize
  // Line rendered under the title, inside the header
  subheader?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/**
 * Centred overlay trapping focus until it closes, its header carrying nothing but the title
 * @param {boolean} open - Overlay is mounted
 * @param {() => void} onClose - Dismiss handler
 * @param {string} title - Overlay title
 * @param {string} [description] - Supporting line under the title
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
        <div className={DIALOG_STYLES.header}>
          <div className={DIALOG_STYLES.heading}>
            <h2 id={titleId} className={DIALOG_STYLES.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={DIALOG_STYLES.description}>
                {description}
              </p>
            )}
            {subheader}
          </div>
          <Button
            variant="icon"
            icon="close"
            onClick={onClose}
            aria-label={ACTION_COPY.close}
            className={DIALOG_STYLES.close}
          />
        </div>
        <div className={cn(DIALOG_STYLES.body, subheader && DIALOG_STYLES.bodyFlush)}>
          {children}
        </div>
        {footer && <div className={DIALOG_STYLES.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
