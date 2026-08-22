'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { DIALOG_STYLES, DRAWER_STYLES } from '@/declarations/ui/variants'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  footer?: ReactNode
  children: ReactNode
}

/**
 * Side panel used for long forms and detail sheets
 * @param {boolean} open - Panel is mounted
 * @param {() => void} onClose - Dismiss handler
 * @param {string} title - Panel title
 * @param {string} [description] - Supporting line under the title
 * @param {ReactNode} [footer] - Controls pinned to the bottom
 * @param {ReactNode} children - Panel content
 * @return {JSX.Element | null}
 */

export const Drawer = ({ open, onClose, title, description, footer, children }: DrawerProps) => {
  const containerRef = useFocusTrap(open, onClose)
  useScrollLock(open)

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div className={DRAWER_STYLES.overlay} role="presentation" onMouseDown={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={DRAWER_STYLES.panel}
      >
        <div className={DIALOG_STYLES.header}>
          <div className="flex flex-col gap-1">
            <h2 className={DIALOG_STYLES.title}>{title}</h2>
            {description && <p className={DIALOG_STYLES.description}>{description}</p>}
          </div>
          <Button
            variant="icon"
            icon="close"
            onClick={onClose}
            aria-label={ACTION_COPY.close}
            className="-mt-1 -mr-2"
          />
        </div>
        <div className={DIALOG_STYLES.body}>{children}</div>
        {footer && <div className={DIALOG_STYLES.footer}>{footer}</div>}
      </div>
    </>,
    document.body
  )
}
