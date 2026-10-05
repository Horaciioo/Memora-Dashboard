'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { DRAWER_STYLES } from '@/declarations/ui/variants'

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
  children,
}: DrawerProps) => {
  const containerRef = useFocusTrap(open, onClose)
  const titleId = useId()
  const descriptionId = useId()
  useScrollLock(open)

  if (!open || typeof document === 'undefined') return null

  const Glyph = ICONS[icon]

  return createPortal(
    <>
      <div className={DRAWER_STYLES.overlay} role="presentation" onMouseDown={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={DRAWER_STYLES.panel}
      >
        <div className={DRAWER_STYLES.header}>
          <span className={DRAWER_STYLES.glyph} aria-hidden="true">
            <Glyph className={DRAWER_STYLES.glyphIcon} />
          </span>
          <h2 id={titleId} className={DRAWER_STYLES.title}>
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="sr-only">
              {description}
            </p>
          )}
          <Button
            variant="icon"
            icon="close"
            onClick={onClose}
            aria-label={ACTION_COPY.close}
            className={DRAWER_STYLES.close}
          />
        </div>
        {subheader && <div className={DRAWER_STYLES.sections}>{subheader}</div>}
        <div className={DRAWER_STYLES.body}>{children}</div>
        {footer && <div className={DRAWER_STYLES.footer}>{footer}</div>}
      </div>
    </>,
    document.body
  )
}
