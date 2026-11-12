'use client'

import type { ReactNode } from 'react'

import { useFloatingWindow } from '@/core/hooks/interaction/layout/useFloatingWindow'
import type { Bounds, Grip, Rect } from '@/core/lib/nexus/terminal/geometry'
import { ICONS } from '@/declarations/ui/icons'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface FloatingWindowProps {
  title: string
  status?: ReactNode
  storageKey: string
  initial: Rect
  bounds: Bounds
  isFolded: boolean
  foldLabel: string
  closeLabel: string
  onFold: () => void
  onClose: () => void
  onEscape?: () => void
  children: ReactNode
}

// Grip classes by direction
const GRIP_STYLES: Record<Grip, string> = {
  east: NEXUS_STYLES.gripEast,
  south: NEXUS_STYLES.gripSouth,
  corner: NEXUS_STYLES.gripCorner,
}

/**
 * Floating window above the page
 * @param {FloatingWindowProps} props - Window props
 * @return {JSX.Element}
 */

export const FloatingWindow = ({
  title,
  status,
  storageKey,
  initial,
  bounds,
  isFolded,
  foldLabel,
  closeLabel,
  onFold,
  onClose,
  onEscape,
  children,
}: FloatingWindowProps) => {
  const { rect, startMove, startResize } = useFloatingWindow(storageKey, initial, bounds)

  return (
    <section
      role="dialog"
      aria-label={title}
      className={cn(NEXUS_STYLES.window, isFolded && NEXUS_STYLES.windowFolded)}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: isFolded ? undefined : rect.height,
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onEscape?.()
      }}
    >
      <header className={NEXUS_STYLES.head} onPointerDown={startMove}>
        <h2 className={NEXUS_STYLES.title}>{title}</h2>
        {status}
        <span className={NEXUS_STYLES.controls}>
          <button type="button" className={NEXUS_STYLES.control} aria-label={foldLabel} onClick={onFold}>
            <ICONS.expand
              className={cn(NEXUS_STYLES.controlIcon, !isFolded && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
          <button type="button" className={NEXUS_STYLES.control} aria-label={closeLabel} onClick={onClose}>
            <ICONS.close className={NEXUS_STYLES.controlIcon} aria-hidden="true" />
          </button>
        </span>
      </header>
      {!isFolded && (
        <div className={NEXUS_STYLES.body}>
          {children}
          {(Object.keys(GRIP_STYLES) as Grip[]).map((grip) => (
            <div
              key={grip}
              className={cn(NEXUS_STYLES.grip, GRIP_STYLES[grip])}
              onPointerDown={startResize(grip)}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </section>
  )
}
