'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { useIsMobileShell } from '@/core/hooks/interaction/useBreakpoint'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { Notification } from '@/managers/infrastructure/Network/NotificationsManager'
import { TONE_ICON, TONES } from '@/declarations/ui/theme'
import { TOAST_STYLES } from '@/declarations/ui/variants'
import { TOAST_VISIBLE } from '@/declarations/ui/responsive'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

// Horizontal drag past this many pixels dismisses the toast instead of snapping back
const SWIPE_DISMISS_PX = 80

/**
 * Toast title
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
  // Rank from the newest
  depth: number
  // Offset once spread
  lift: number
  isSpread: boolean
  // Replays the countdown
  generation: number
  onDismiss: () => void
  onMeasure: (id: string, height: number) => void
}

/**
 * One toast of the pile
 * @param {ToastProps} props - Content
 * @return {JSX.Element}
 */

const Toast = ({
  notification,
  depth,
  lift,
  isSpread,
  generation,
  onDismiss,
  onMeasure,
}: ToastProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const tone = TONES[notification.tone]
  const ToneIcon = ICONS[TONE_ICON[notification.tone]]
  const CloseIcon = ICONS.close

  // Height drives the spread
  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new ResizeObserver(() => onMeasure(notification.id, node.offsetHeight))
    observer.observe(node)

    return () => observer.disconnect()
  }, [notification.id, onMeasure])

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Capturing the pointer would swallow the click on the close button
    if ((event.target as HTMLElement).closest('button')) return

    startXRef.current = event.clientX
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const trackDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDragging) setDragX(event.clientX - startXRef.current)
  }

  const endDrag = () => {
    setDragging(false)
    if (Math.abs(dragX) > SWIPE_DISMISS_PX) return onDismiss()

    setDragX(0)
  }

  return (
    <div
      ref={ref}
      data-toast
      data-front={depth === 0 || undefined}
      aria-hidden={!isSpread && depth > 0 ? true : undefined}
      className={TOAST_STYLES.item}
      style={{ '--toast-depth': depth, '--toast-lift': `${lift}px` } as CSSProperties}
    >
      <div
        onPointerDown={startDrag}
        onPointerMove={trackDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          transform: dragX ? `translateX(${dragX}px)` : undefined,
          opacity: isDragging ? Math.max(1 - Math.abs(dragX) / (SWIPE_DISMISS_PX * 2), 0.3) : 1,
        }}
        className={cn(TOAST_STYLES.toast, !isDragging && TOAST_STYLES.settle)}
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
        <span
          key={generation}
          className={cn(
            TOAST_STYLES.countdown,
            tone.solid,
            isSpread && TOAST_STYLES.countdownPaused
          )}
          style={{ animationDuration: `${notification.durationMs}ms` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

/**
 * Toast pile: newest in front
 * @return {JSX.Element | null}
 */

export const NotificationsToaster = () => {
  const { notifications, dismiss, pause, resume } = useNotifications()
  const isMobileShell = useIsMobileShell()
  const [heights, setHeights] = useState<Record<string, number>>({})
  const [isSpread, setSpread] = useState(false)
  const [generation, setGeneration] = useState(0)

  const measure = useCallback((id: string, height: number) => {
    setHeights((current) => (current[id] === height ? current : { ...current, [id]: height }))
  }, [])

  if (notifications.length === 0) return null

  // Newest first
  const pile = [...notifications].reverse()
  const lifts = pile.map((_, index) =>
    pile
      .slice(0, index)
      .reduce((sum, entry) => sum + (heights[entry.id] ?? 0) + TOAST_STYLES.gapPx, 0)
  )
  const front = heights[pile[0]?.id ?? ''] ?? 0
  const last = pile.at(-1)
  const spreadHeight = (lifts[pile.length - 1] ?? 0) + (heights[last?.id ?? ''] ?? 0)
  const layers = isMobileShell ? TOAST_VISIBLE.mobile : TOAST_VISIBLE.desktop

  // Every timer waits
  const spread = () => {
    setSpread(true)
    notifications.forEach((notification) => pause(notification.id))
  }

  // Every timer restarts
  const gather = () => {
    setSpread(false)
    setGeneration((current) => current + 1)
    notifications.forEach((notification) => resume(notification.id))
  }

  return (
    <section
      aria-live="polite"
      className={cn(TOAST_STYLES.stack, isSpread && TOAST_STYLES.stackSpread)}
      style={
        {
          '--toast-front': `${front}px`,
          '--toast-count': Math.min(pile.length, layers),
          '--toast-layers': layers,
          height: isSpread ? spreadHeight : undefined,
        } as CSSProperties
      }
      onMouseEnter={spread}
      onMouseLeave={gather}
      onFocus={spread}
      onBlur={gather}
    >
      {pile.map((notification, index) => (
        <Toast
          key={notification.id}
          notification={notification}
          depth={index}
          lift={lifts[index] ?? 0}
          isSpread={isSpread}
          generation={generation}
          onDismiss={() => dismiss(notification.id)}
          onMeasure={measure}
        />
      ))}
    </section>
  )
}
