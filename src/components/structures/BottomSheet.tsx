'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { useSheetDrag } from '@/core/hooks/interaction/useSheetDrag'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { BOTTOM_SHEET } from '@/declarations/ui/variants'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  // Accessible name, shown only when no figure carries a title
  title: string
  // Floats above the panel on the scrim
  figure?: ReactNode
  children: ReactNode
}

/**
 * Floating sheet rising from the bottom edge, never glued to it
 * @param {boolean} open - Sheet is mounted
 * @param {() => void} onClose - Dismiss handler
 * @param {string} title - Accessible name
 * @param {ReactNode} [figure] - Title and line floating above the panel
 * @param {ReactNode} children - Sheet content
 * @return {JSX.Element | null}
 */

export const BottomSheet = ({ open, onClose, title, figure, children }: BottomSheetProps) => {
  const containerRef = useFocusTrap(open, onClose)
  const titleId = useId()
  const drag = useSheetDrag(onClose)
  useScrollLock(open)

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className={BOTTOM_SHEET.overlay} role="presentation" onMouseDown={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className={BOTTOM_SHEET.frame}
        style={
          drag.offset > 0 || drag.isDragging
            ? { transform: `translateY(${drag.offset}px)`, transition: 'none' }
            : undefined
        }
      >
        <Button
          variant="icon"
          icon="close"
          onClick={onClose}
          aria-label={ACTION_COPY.close}
          className={BOTTOM_SHEET.close}
        />
        {figure && <div className={BOTTOM_SHEET.figure}>{figure}</div>}
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        <div className={BOTTOM_SHEET.panel}>
          <div className={BOTTOM_SHEET.grip} {...drag.handlers}>
            <span className={BOTTOM_SHEET.gripBar} aria-hidden="true" />
          </div>
          <div className={BOTTOM_SHEET.body}>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}
