'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBannerHost } from '@/core/hooks/interaction/layout/useBannerHost'
import { PAGE_TABS_HOST_ID } from '@/declarations/ui/banners'
import { TABS_STYLES } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'
import { panelDurationMs, prefersReducedMotion } from '@/utils/motion'

export interface TabItem {
  value: string
  label: string
  icon?: IconName
  // Holds at least one rejection
  flagged?: boolean
  // Administration tab, painted red
  danger?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  label: string
  // Strip centred over its panel
  centered?: boolean
  // Carried under the banner when the page has one
  inBanner?: boolean
  // Longer glide and a pulse on arrival
  emphasis?: boolean
}

// Last box drawn per strip, survives a remount
const LAST_DRAWN = new Map<string, { left: number; width: number }>()

// Glide length factor
const EMPHASIS_FACTOR = 2.5

/**
 * Horizontal tab strip driving a single panel below it
 * @param {TabItem[]} items - Tabs in display order
 * @param {string} value - Selected tab value
 * @param {(value: string) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the strip
 * @param {boolean} [centered] - Centres the strip
 * @param {boolean} [inBanner] - Sits under the banner
 * @param {boolean} [emphasis] - Slow glide with pulse
 * @return {JSX.Element}
 */

export const Tabs = ({
  items,
  value,
  onChange,
  label,
  centered,
  inBanner,
  emphasis,
}: TabsProps) => {
  const host = useBannerHost(PAGE_TABS_HOST_ID)
  const tabsRef = useRef(new Map<string, HTMLButtonElement>())
  const listRef = useRef<HTMLDivElement | null>(null)
  const ruleRef = useRef<HTMLSpanElement | null>(null)

  // The rule glides toward the open tab, from where this strip last drew it
  useLayoutEffect(() => {
    const rule = ruleRef.current
    if (!rule) return

    const target = () => {
      const tab = tabsRef.current.get(value)
      return tab ? { left: tab.offsetLeft, width: tab.offsetWidth } : null
    }

    // Written on the node
    const place = (box: { left: number; width: number }, duration: number) => {
      rule.style.transition =
        duration > 0
          ? [
              `transform ${duration}ms var(--motion-ease-out)`,
              `width ${duration}ms var(--motion-ease-out)`,
            ].join(', ')
          : 'none'
      rule.style.width = `${box.width}px`
      rule.style.transform = `translateX(${box.left}px)`
    }

    const end = target()
    if (!end) return

    const from = LAST_DRAWN.get(label)
    const duration = panelDurationMs() * (emphasis ? EMPHASIS_FACTOR : 1)

    if (!from || prefersReducedMotion()) place(end, 0)
    else {
      // Start where the strip left off, then move once that is painted
      place(from, 0)
      void rule.offsetWidth
      place(end, duration)

      // Pulse restarts on each arrival
      if (emphasis) {
        rule.classList.remove(TABS_STYLES.arrive)
        void rule.offsetWidth
        rule.classList.add(TABS_STYLES.arrive)
      }
    }
    LAST_DRAWN.set(label, end)

    // Later layout changes snap the rule back on its tab
    const observer = new ResizeObserver(() => {
      const next = target()
      const last = LAST_DRAWN.get(label)
      if (!next || (last && last.left === next.left && last.width === next.width)) return

      place(next, 0)
      LAST_DRAWN.set(label, next)
    })
    if (listRef.current) observer.observe(listRef.current)
    tabsRef.current.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [value, items.length, emphasis, label])

  // A tab opened from off screen scrolls the strip, never the page
  useEffect(() => {
    const list = listRef.current
    const tab = tabsRef.current.get(value)
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return

    list.scrollTo({
      left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
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
              isActive && (item.danger ? TABS_STYLES.activeDanger : TABS_STYLES.active),
              item.danger && !isActive && TABS_STYLES.danger,
              item.flagged && !isActive && !item.danger && TABS_STYLES.flagged
            )}
          >
            <span className={TABS_STYLES.content}>
              {Icon && <Icon className={TABS_STYLES.icon} aria-hidden="true" />}
              <span className={cn(TABS_STYLES.label, Icon && TABS_STYLES.labelBeside)}>
                {item.label}
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
