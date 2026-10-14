'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { SCROLL_CARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ScrollCardProps {
  title?: string
  children: ReactNode
}

/**
 * Card that never outgrows its box, scrolling with a shadow where more lies below
 * @param {string} [title] - Small heading
 * @param {ReactNode} children - Card content
 * @return {JSX.Element}
 */

export const ScrollCard = ({ title, children }: ScrollCardProps) => {
  const area = useRef<HTMLDivElement>(null)
  const [hasMore, setHasMore] = useState(false)

  // Watch the scroll position and the size
  useEffect(() => {
    const node = area.current
    if (!node) return

    const measure = () => setHasMore(node.scrollTop + node.clientHeight < node.scrollHeight - 2)

    measure()
    node.addEventListener('scroll', measure)
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    Array.from(node.children).forEach((child) => observer.observe(child))

    return () => {
      node.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [])

  return (
    <div className={SCROLL_CARD.root}>
      <div className={SCROLL_CARD.frame}>
        <div ref={area} className={cn(SCROLL_CARD.scroll, hasMore && SCROLL_CARD.fade)}>
          {title && <span className={SCROLL_CARD.title}>{title}</span>}
          {children}
        </div>
      </div>
    </div>
  )
}
