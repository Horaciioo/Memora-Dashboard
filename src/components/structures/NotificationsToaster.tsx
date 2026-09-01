'use client'

import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useIsMobileShell } from '@/core/hooks/interaction/useBreakpoint'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { Notification } from '@/managers/infrastructure/Network/NotificationsManager'
import { TONE_BORDER, TONE_ICON, TONES } from '@/declarations/ui/theme'
import { TOAST_STYLES } from '@/declarations/ui/variants'
import { TOAST_VISIBLE } from '@/declarations/ui/responsive'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

// Horizontal drag past this many pixels dismisses the toast instead of snapping back
const SWIPE_DISMISS_PX = 80

/**
 * Toast title, its emphasis substring rendered bold
 * @param {string} title - Full sentence
 * @param {string} [emphasis] - Substring rendered bold
 * @return {JSX.Element}
 */

const ToastTitle = ({ title, emphasis }: { title: string; emphasis?: string }) => {
  const index = emphasis ? title.indexOf(emphasis) : -1
  if (!emphasis || index === -1) return <>{title}</>

  return (
    <>
      {title.slice(0, index)}
      <strong>{emphasis}</strong>
      {title.slice(index + emphasis.length)}
    </>
  )
}

interface ToastProps {
  notification: Notification
  onDismiss: () => void
  onPause: () => void
  onResume: () => void
}

/**
 * One toast, draggable horizontally to dismiss — a tap of any kind pauses its timer,
 * releasing short of the threshold resumes it
 * @param {Notification} notification - Toast to render
 * @param {() => void} onDismiss - Called past the swipe threshold
 * @param {() => void} onPause - Called on press
 * @param {() => void} onResume - Called on release short of the threshold
 * @return {JSX.Element}
 */

const Toast = ({ notification, onDismiss, onPause, onResume }: ToastProps) => {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const tone = TONES[notification.tone]
  const ToneIcon = ICONS[TONE_ICON[notification.tone]]
  const CloseIcon = ICONS.close

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    startXRef.current = event.clientX
    setDragging(true)
    onPause()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const trackDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return

    setDragX(event.clientX - startXRef.current)
  }

  const endDrag = () => {
    setDragging(false)

    if (Math.abs(dragX) > SWIPE_DISMISS_PX) {
      onDismiss()
      return
    }

    setDragX(0)
    onResume()
  }

  return (
    <div
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onPointerDown={startDrag}
      onPointerMove={trackDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        transform: dragX ? `translateX(${dragX}px)` : undefined,
        opacity: isDragging ? Math.max(1 - Math.abs(dragX) / (SWIPE_DISMISS_PX * 2), 0.3) : 1,
      }}
      className={cn(
        TOAST_STYLES.toast,
        TONE_BORDER[notification.tone],
        !isDragging && 'transition-[transform,opacity] motion-reduce:transition-none'
      )}
    >
      <span className={cn(TOAST_STYLES.badge, tone.soft, tone.text)}>
        <ToneIcon className={TOAST_STYLES.glyph} aria-hidden="true" />
      </span>
      <div className={TOAST_STYLES.body}>
        <p className={TOAST_STYLES.title}>
          <ToastTitle title={notification.title} emphasis={notification.emphasis} />
        </p>
        {notification.description && (
          <p className={TOAST_STYLES.description}>{notification.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={ACTION_COPY.close}
        className={TOAST_STYLES.dismiss}
      >
        <CloseIcon className={TOAST_STYLES.glyph} aria-hidden="true" />
      </button>
    </div>
  )
}

/**
 * Renders the active toast stack, one at a time on mobile above the nav pill, several
 * top right from md
 * @return {JSX.Element}
 */

export const NotificationsToaster = () => {
  const { notifications, dismiss, pause, resume } = useNotifications()
  const isMobileShell = useIsMobileShell()

  const visible = notifications.slice(
    0,
    isMobileShell ? TOAST_VISIBLE.mobile : TOAST_VISIBLE.desktop
  )

  return (
    <div className={TOAST_STYLES.stack} aria-live="polite">
      {visible.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={() => dismiss(notification.id)}
          onPause={() => pause(notification.id)}
          onResume={() => resume(notification.id)}
        />
      ))}
    </div>
  )
}
