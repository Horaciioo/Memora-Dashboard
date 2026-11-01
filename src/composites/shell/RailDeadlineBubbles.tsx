'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { findVisibleBeacon } from '@/core/lib/beacons'
import { routeBeacon } from '@/declarations/ui/beacons'
import { DEADLINE_BUBBLE } from '@/declarations/ui/variants'

// Room between the entry and the bubble
const BUBBLE_GAP = 12

// Time before the pill leaves
const BUBBLE_LIFETIME = 5000

// Pills already shown, so a remount never brings them back
const dismissedHrefs = new Set<string>()

export interface RailDeadlineBubble {
  href: string
  message: string
}

interface Anchor {
  left: number
  center: number
}

/**
 * Where each entry sits on screen
 * @param {string[]} hrefs - Entries to follow
 * @return {Record<string, Anchor>} - Anchors by entry
 */

const useAnchors = (hrefs: string[]): Record<string, Anchor> => {
  const [anchors, setAnchors] = useState<Record<string, Anchor>>({})
  const key = hrefs.join('|')

  useEffect(() => {
    let frame = 0

    // Look again every frame
    const look = () => {
      const next: Record<string, Anchor> = {}
      key.split('|').forEach((href) => {
        const node = href ? findVisibleBeacon(routeBeacon(href)) : null
        if (!node) return
        const box = node.getBoundingClientRect()
        next[href] = { left: box.left + box.width, center: box.top + box.height / 2 }
      })

      setAnchors((current) => {
        const hrefsNow = Object.keys(next)
        const isSame =
          hrefsNow.length === Object.keys(current).length &&
          hrefsNow.every(
            (href) =>
              current[href] &&
              Math.abs(current[href].left - next[href].left) < 0.5 &&
              Math.abs(current[href].center - next[href].center) < 0.5
          )

        return isSame ? current : next
      })
      frame = requestAnimationFrame(look)
    }

    frame = requestAnimationFrame(look)

    return () => cancelAnimationFrame(frame)
  }, [key])

  return anchors
}

export interface RailDeadlineBubblesProps {
  bubbles: RailDeadlineBubble[]
}

/**
 * Pills beside the rail entries warning of late items, stacked apart
 * @param {RailDeadlineBubble[]} bubbles - Entry and words of each pill
 * @return {JSX.Element | null}
 */

export const RailDeadlineBubbles = ({ bubbles }: RailDeadlineBubblesProps) => {
  const pathname = usePathname()
  // Pills point at rail entries, a phone has none
  const isMobile = useIsMobileShell()
  const [, setTick] = useState(0)

  // The portal needs the document
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // A pill leaves for good, after a while or once hovered
  const dismiss = (href: string) => {
    if (dismissedHrefs.has(href)) return
    dismissedHrefs.add(href)
    setTick((tick) => tick + 1)
  }

  // A pill leaves once its page is open
  const shown = (isMobile ? [] : bubbles).filter(
    ({ href }) => !dismissedHrefs.has(href) && pathname !== href && !pathname.startsWith(`${href}/`)
  )
  const anchors = useAnchors(shown.map(({ href }) => href))

  // Each pill sits level with its entry
  const placed = shown.filter(({ href }) => anchors[href])

  if (!isMounted) return null

  return createPortal(
    <>
      {placed.map(({ href, message }) => (
        <Pill
          key={href}
          href={href}
          message={message}
          left={anchors[href].left + BUBBLE_GAP}
          top={anchors[href].center}
          onDismiss={dismiss}
        />
      ))}
    </>,
    document.body
  )
}

interface PillProps extends RailDeadlineBubble {
  left: number
  top: number
  onDismiss: (href: string) => void
}

/**
 * One pill, leaving after its lifetime or a hover
 * @param {PillProps} props - Words, place and exit
 * @return {JSX.Element}
 */

const Pill = ({ href, message, left, top, onDismiss }: PillProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(href), BUBBLE_LIFETIME)
    return () => clearTimeout(timer)
  }, [href, onDismiss])

  return (
    <Link
      href={href}
      role="status"
      className={DEADLINE_BUBBLE.root}
      style={{ left, top }}
      onPointerEnter={() => onDismiss(href)}
    >
      <svg
        viewBox="0 0 12 18"
        className={DEADLINE_BUBBLE.tail}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0.5C8.6 3 4.6 6.4 1.3 8.1a1.05 1.05 0 0 0 0 1.8C4.6 11.6 8.6 15 12 17.5Z"
          fill="currentColor"
        />
      </svg>
      {message}
    </Link>
  )
}
