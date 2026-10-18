'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ModalHeader } from '@/components/structures/overlays/ModalHeader'
import { useFocusTrap } from '@/core/hooks/interaction/layout/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/layout/useScrollLock'
import type { IconName } from '@/declarations/ui/icons'
import { DRAWER_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  // Action the drawer carries
  title: ReactNode
  icon: IconName
  description?: string
  // Line under the header
  subheader?: ReactNode
  footer?: ReactNode
  isWide?: boolean
  children: ReactNode
}

/**
 * Drawer unfolding from the right edge of the page
 * @param {boolean} open - Drawer is mounted
 * @param {() => void} onClose - Dismiss handler
 * @param {ReactNode} title - Action carried
 * @param {IconName} icon - Glyph beside the title
 * @param {string} [description] - Screen reader only
 * @param {ReactNode} [subheader] - Line under the header
 * @param {ReactNode} [footer] - Controls pinned to the bottom
 * @param {boolean} [isWide] - Wider panel from md
 * @param {ReactNode} children - Drawer content
 * @return {JSX.Element | null}
 */

export const Drawer = ({
  open,
  onClose,
  title,
  icon,
  description,
  subheader,
  footer,
  isWide = false,
  children,
}: DrawerProps) => {
  const containerRef = useFocusTrap(open, onClose)
  const titleId = useId()
  const descriptionId = useId()
  useScrollLock(open)

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div className={DRAWER_STYLES.overlay} role="presentation" onMouseDown={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(DRAWER_STYLES.panel, isWide && DRAWER_STYLES.wide)}
      >
        <ModalHeader titleId={titleId} title={title} icon={icon} onClose={onClose} />
        {description && (
          <p id={descriptionId} className="sr-only">
            {description}
          </p>
        )}
        {subheader && <div className={DRAWER_STYLES.sections}>{subheader}</div>}
        <div className={DRAWER_STYLES.body}>{children}</div>
        {footer && <div className={DRAWER_STYLES.footer}>{footer}</div>}
      </div>
    </>,
    document.body
  )
}
