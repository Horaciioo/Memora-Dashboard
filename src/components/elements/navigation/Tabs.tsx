'use client'

import { TABS_STYLES } from '@/declarations/ui/variants'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface TabItem {
  value: string
  label: string
  icon?: IconName
  count?: number
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  label: string
}

/**
 * Horizontal tab strip driving a single panel below it
 * @param {TabItem[]} items - Tabs in display order
 * @param {string} value - Selected tab value
 * @param {(value: string) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the strip
 * @return {JSX.Element}
 */

export const Tabs = ({ items, value, onChange, label }: TabsProps) => (
  <div className={TABS_STYLES.list} role="tablist" aria-label={label}>
    {items.map((item) => {
      const Icon = item.icon ? ICONS[item.icon] : null
      const isActive = item.value === value

      return (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(item.value)}
          className={cn(TABS_STYLES.tab, isActive && TABS_STYLES.active)}
        >
          <span className="flex items-center gap-1.5">
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {item.label}
            {item.count !== undefined && (
              <span className="text-xs text-[var(--color-ink-subtle)] tabular-nums">
                {item.count}
              </span>
            )}
          </span>
        </button>
      )
    })}
  </div>
)
