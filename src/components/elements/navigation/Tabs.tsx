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

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  label: string
}

/**
 * Horizontal tab strip driving a single panel below it, its rule sliding from the tab
 * being left to the tab being opened
 * @param {TabItem[]} items - Tabs in display order
 * @param {string} value - Selected tab value
 * @param {(value: string) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the strip
 * @return {JSX.Element}
 */

export const Tabs = ({ items, value, onChange, label }: TabsProps) => {
  const tabsRef = useRef(new Map<string, HTMLButtonElement>())
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

    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [value, items.length])

  // A tab opened from off screen scrolls itself into view
  useEffect(() => {
    tabsRef.current.get(value)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [value])

  return (
    <div className={TABS_STYLES.list} role="tablist" aria-label={label}>
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
            onClick={() => onChange(item.value)}
            className={cn(
              TABS_STYLES.tab,
              isActive && TABS_STYLES.active,
              item.flagged && !isActive && TABS_STYLES.flagged
            )}
          >
            <span className="flex items-center gap-1.5">
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              {item.label}
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
