'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TABS_STYLES } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

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
}

/**
 * Label visibility of one tab
 * @param {TabCollapse} collapse - Strip-wide collapse mode
 * @param {boolean} isActive - Tab is the open one
 * @return {string} - Classes sizing the label span
 */

const labelReveal = (collapse: TabCollapse, isActive: boolean): string => {
  if (collapse === 'never' || isActive) return 'max-w-32 opacity-100'
  if (collapse === 'always') return 'max-w-0 opacity-0'

  return 'max-w-0 opacity-0 sm:max-w-32 sm:opacity-100'
}

/**
 * Horizontal tab strip driving a single panel below it, its rule sliding from the tab
 * being left to the tab being opened. A tab without an icon always keeps its label —
 * collapsing it would leave nothing to read
 * @param {TabItem[]} items - Tabs in display order
 * @param {string} value - Selected tab value
 * @param {(value: string) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the strip
 * @param {TabCollapse} [collapse] - Label visibility mode, defaults to 'mobile'
 * @return {JSX.Element}
 */

export const Tabs = ({ items, value, onChange, label, collapse = 'mobile' }: TabsProps) => {
  const tabsRef = useRef(new Map<string, HTMLButtonElement>())
  const listRef = useRef<HTMLDivElement | null>(null)
  const [rule, setRule] = useState({ left: 0, width: 0 })

  // The rule tracks the selected tab, and follows it when the strip is laid out again
  useLayoutEffect(() => {
    const measure = () => {
      const tab = tabsRef.current.get(value)
      if (!tab) return

      // Same geometry keeps the same object, so measuring never re-renders
      setRule((current) =>
        current.left === tab.offsetLeft && current.width === tab.offsetWidth
          ? current
          : { left: tab.offsetLeft, width: tab.offsetWidth }
      )
    }

    measure()

    const list = listRef.current
    window.addEventListener('resize', measure)
    // The freshly opened tab's label is still widening at this point, catch its final width
    list?.addEventListener('transitionend', measure)

    return () => {
      window.removeEventListener('resize', measure)
      list?.removeEventListener('transitionend', measure)
    }
  }, [value, items.length])

  // A tab opened from off screen scrolls itself into view
  useEffect(() => {
    tabsRef.current.get(value)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [value])

  return (
    <div ref={listRef} className={TABS_STYLES.list} role="tablist" aria-label={label}>
      {items.map((item) => {
        const Icon = item.icon ? ICONS[item.icon] : null
        const isActive = item.value === value
        // Nothing to collapse to without an icon, the label stays put
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
            <span className="flex items-center gap-1.5">
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-[var(--motion-duration-panel)] motion-reduce:transition-none',
                  labelReveal(reveal, isActive)
                )}
              >
                {item.label}
              </span>
            </span>
          </button>
        )
      })}
      <span
        className={TABS_STYLES.indicator}
        style={{ width: rule.width, transform: `translateX(${rule.left}px)` }}
        aria-hidden="true"
      />
    </div>
  )
}
