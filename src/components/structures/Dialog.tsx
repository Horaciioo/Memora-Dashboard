'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { TONE_ICON, TONES, type Tone } from '@/declarations/ui/theme'
import { DIALOG_SIZES, DIALOG_STYLES, type DialogSize } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  // Tints the header badge and stands for the weight of the gesture
  tone?: Tone
  // Overrides the glyph the tone would pick
  icon?: IconName
  size?: DialogSize
  // Line rendered under the title, inside the header
  subheader?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/**
 * Centred overlay trapping focus until it closes, its header carrying a tone badge that
 * says at a glance what kind of gesture is being asked for
 * @param {boolean} open - Overlay is mounted
 * @param {() => void} onClose - Dismiss handler
 * @param {string} title - Overlay title
 * @param {string} [description] - Supporting line under the title
 * @param {Tone} [tone] - Tone of the header badge
 * @param {IconName} [icon] - Glyph overriding the tone default
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
  tone,
  icon,
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

  // A badge only shows once the caller asked for one, either way round
  const badgeTone = tone ?? (icon ? 'brand' : null)
  const BadgeIcon = badgeTone ? ICONS[icon ?? TONE_ICON[badgeTone]] : null

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
        <span className={DIALOG_STYLES.grip} aria-hidden="true" />
        <div className={DIALOG_STYLES.header}>
          {badgeTone && BadgeIcon && (
            <span className={cn(DIALOG_STYLES.badge, TONES[badgeTone].soft, TONES[badgeTone].text)}>
              <BadgeIcon className={DIALOG_STYLES.glyph} aria-hidden="true" />
            </span>
          )}
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
        <div className={DIALOG_STYLES.body}>{children}</div>
        {footer && <div className={DIALOG_STYLES.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
