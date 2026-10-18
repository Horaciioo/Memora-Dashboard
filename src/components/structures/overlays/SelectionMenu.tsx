'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import { FloatingLayer } from '@/components/structures/overlays/FloatingLayer'
import { ICONS } from '@/declarations/ui/icons'
import { SELECTION_MENU_STYLES } from '@/declarations/ui/variants'
import { SELECTION_COPY } from '@/declarations/work/copy'
import type { MenuItem } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

export interface SelectionMenuProps {
  items: MenuItem[]
  count: number
}

// Gap to the selection
const ANCHOR_GAP = 12
const EDGE_MARGIN = 12

/**
 * Actions of a selection
 * @param {MenuItem[]} items - Entries
 * @param {number} count - Selected elements
 * @return {JSX.Element}
 */

export const SelectionMenu = ({ items, count }: SelectionMenuProps) => {
  const panel = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  // Sit beside first pick
  useLayoutEffect(() => {
    const node = panel.current
    const anchor = document.querySelector('[data-picked]')
    if (!node || !anchor) return

    const target = anchor.getBoundingClientRect()
    const { width, height } = node.getBoundingClientRect()
    const beside =
      target.right + ANCHOR_GAP + width <= window.innerWidth - EDGE_MARGIN
        ? target.right + ANCHOR_GAP
        : target.left - ANCHOR_GAP - width
    const top = Math.min(target.top, window.innerHeight - height - EDGE_MARGIN)

    setPosition({
      left: Math.max(EDGE_MARGIN, beside),
      top: Math.max(EDGE_MARGIN, top),
    })
  }, [count])

  const shown = items.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <FloatingLayer>
      <div
        ref={panel}
        role="menu"
        aria-label={SELECTION_COPY.label}
        className={SELECTION_MENU_STYLES.panel}
        style={position ?? { left: EDGE_MARGIN, top: EDGE_MARGIN, visibility: 'hidden' }}
      >
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={SELECTION_COPY.search}
          aria-label={SELECTION_COPY.search}
          className={SELECTION_MENU_STYLES.search}
        />
        <p className={SELECTION_MENU_STYLES.heading}>{SELECTION_COPY.label}</p>
        {shown.length === 0 && <p className={SELECTION_MENU_STYLES.empty}>{SELECTION_COPY.none}</p>}
        {shown.map((item) => {
          const Icon = item.icon ? ICONS[item.icon] : null

          return (
            <div key={item.id}>
              {item.separatorBefore && <div className={SELECTION_MENU_STYLES.separator} />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={item.onSelect}
                className={cn(
                  SELECTION_MENU_STYLES.item,
                  item.danger && SELECTION_MENU_STYLES.danger
                )}
              >
                {Icon && <Icon className={SELECTION_MENU_STYLES.icon} aria-hidden="true" />}
                {item.label}
                {item.shortcut && (
                  <span className={SELECTION_MENU_STYLES.shortcut}>{item.shortcut}</span>
                )}
              </button>
            </div>
          )
        })}
        <div className={SELECTION_MENU_STYLES.separator} />
        <p className={SELECTION_MENU_STYLES.footer}>{SELECTION_COPY.count(count)}</p>
      </div>
    </FloatingLayer>
  )
}
