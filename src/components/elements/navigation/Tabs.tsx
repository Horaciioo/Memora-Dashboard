'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBannerHost } from '@/core/hooks/interaction/useBannerHost'
import { PAGE_TABS_HOST_ID } from '@/declarations/ui/banners'
import { TABS_STYLES } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'
import { easeOut, panelDurationMs, prefersReducedMotion } from '@/utils/motion'

export interface TabItem {
  value: string
  label: string
  icon?: IconName
  // Holds at least one rejection
  flagged?: boolean
}

// Which tabs keep their label alongside the icon
export type TabCollapse = 'mobile' | 'always' | 'never'

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  label: string
  // Icon-only tabs revealing their label — on the open tab only ('mobile', the default,
  // widens to every tab from sm; 'always' never widens; 'never' keeps every label shown)
  collapse?: TabCollapse
  // Strip centred over its panel
  centered?: boolean
  // Carried into the banner notch when the page has one
  inBanner?: boolean
}

/**
 * Label visibility of one tab
 * @param {TabCollapse} collapse - Strip-wide collapse mode
 * @param {boolean} isActive - Tab is the open one
 * @return {string} - Classes sizing the label track
 */

const labelReveal = (collapse: TabCollapse, isActive: boolean): string => {
  if (collapse === 'never' || isActive) return TABS_STYLES.labelOpen
  if (collapse === 'always') return TABS_STYLES.labelShut

  return TABS_STYLES.labelShutMobile
}

/**
 * Horizontal tab strip driving a single panel below it
 * @param {TabItem[]} items - Tabs in display order
 * @param {string} value - Selected tab value
 * @param {(value: string) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the strip
 * @param {TabCollapse} [collapse] - Label visibility mode
 * @param {boolean} [centered] - Centres the strip
 * @param {boolean} [inBanner] - Sits in the banner notch
 * @return {JSX.Element}
 */

export const Tabs = ({
  items,
  value,
  onChange,
  label,
  collapse = 'mobile',
  centered,
  inBanner,
}: TabsProps) => {
  const host = useBannerHost(PAGE_TABS_HOST_ID)
  const tabsRef = useRef(new Map<string, HTMLButtonElement>())
  const listRef = useRef<HTMLDivElement | null>(null)
  const ruleRef = useRef<HTMLSpanElement | null>(null)
  const drawn = useRef<{ left: number; width: number } | null>(null)

  // Written on the node
  const draw = (left: number, width: number) => {
    const rule = ruleRef.current
    if (!rule) return

    drawn.current = { left, width }
    rule.style.width = `${width}px`
    rule.style.transform = `translateX(${left}px)`
  }

  // The rule glides toward the open tab
  useLayoutEffect(() => {
    const target = () => {
      const tab = tabsRef.current.get(value)
      return tab ? { left: tab.offsetLeft, width: tab.offsetWidth } : null
    }

    const from = drawn.current
    const duration = panelDurationMs()
    let frame = 0
    let gliding = false

    // First paint or calm mode
    if (!from || prefersReducedMotion()) {
      const end = target()
      if (end) draw(end.left, end.width)
    } else {
      const startedAt = performance.now()
      gliding = true

      const step = (now: number) => {
        const end = target()
        if (!end) return

        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = easeOut(progress)
        draw(
          from.left + (end.left - from.left) * eased,
          from.width + (end.width - from.width) * eased
        )

        if (progress < 1) frame = requestAnimationFrame(step)
        else gliding = false
      }

      frame = requestAnimationFrame(step)
    }

    // Later layout changes snap the rule back on its tab
    const observer = new ResizeObserver(() => {
      if (gliding) return

      const end = target()
      if (end) draw(end.left, end.width)
    })
    if (listRef.current) observer.observe(listRef.current)
    tabsRef.current.forEach((node) => observer.observe(node))

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [value, items.length])

  // A tab opened from off screen scrolls itself into view
  useEffect(() => {
    tabsRef.current.get(value)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [value])

  const strip = (
    <div
      ref={listRef}
      className={cn(TABS_STYLES.list, centered && TABS_STYLES.listCentered)}
      role="tablist"
      aria-label={label}
    >
      {items.map((item) => {
        const Icon = item.icon ? ICONS[item.icon] : null
        const isActive = item.value === value
        // Nothing to collapse to without an icon
        const reveal = item.icon ? collapse : 'never'

        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) tabsRef.current.set(item.value, node)
              else tabsRef.current.delete(item.value)
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={item.label}
            onClick={() => onChange(item.value)}
            className={cn(
              TABS_STYLES.tab,
              isActive && TABS_STYLES.active,
              item.flagged && !isActive && TABS_STYLES.flagged
            )}
          >
            <span className={TABS_STYLES.content}>
              {Icon && <Icon className={TABS_STYLES.icon} aria-hidden="true" />}
              <span className={cn(TABS_STYLES.labelTrack, labelReveal(reveal, isActive))}>
                <span className={cn(TABS_STYLES.label, Icon && TABS_STYLES.labelBeside)}>
                  {item.label}
                </span>
              </span>
            </span>
          </button>
        )
      })}
      <span ref={ruleRef} className={TABS_STYLES.indicator} aria-hidden="true" />
    </div>
  )

  return inBanner && host ? createPortal(strip, host) : strip
}
