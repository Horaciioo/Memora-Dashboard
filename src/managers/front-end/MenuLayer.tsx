'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import { MENU_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MENU_STYLES } from '@/declarations/ui/variants'
import type { MenuItem } from '@/managers/front-end/MenuManager'
import { cn } from '@/utils/classnames'

// Room kept so the panel never overflows the viewport
const EDGE_MARGIN = 12

interface OpenMenuView {
  title?: string
  searchable?: boolean
  items: MenuItem[]
  x: number
  y: number
}

interface Flyout {
  items: MenuItem[]
  x: number
  y: number
}

// Text without accents or case
const plain = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

/**
 * Keep an element inside the viewport
 * @param {unknown} trigger - Re-measure key
 * @return {RefObject<HTMLDivElement | null>} - Panel ref
 */

const useKeepInside = (trigger: unknown) => {
  const panel = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = panel.current
    if (!node) return

    // Rows are taller on touch, measure rather than guess
    const box = node.getBoundingClientRect()
    const overflow = box.bottom - (window.innerHeight - EDGE_MARGIN)
    if (overflow > 0) node.style.top = `${Math.max(EDGE_MARGIN, box.top - overflow)}px`

    const side = box.right - (window.innerWidth - EDGE_MARGIN)
    if (side > 0) node.style.left = `${Math.max(EDGE_MARGIN, box.left - side)}px`
  }, [trigger])

  return panel
}

interface MenuRowsProps {
  items: MenuItem[]
  onClose: () => void
  onFlyout?: (flyout: Flyout | null, source: HTMLElement | null) => void
}

/**
 * Rows of one menu panel
 * @param {MenuRowsProps} props - Items, close and flyout handlers
 * @return {JSX.Element}
 */

const MenuRows = ({ items, onClose, onFlyout }: MenuRowsProps) => (
  <>
    {items.map((item) => {
      const Icon = item.icon ? ICONS[item.icon] : null
      const Chevron = ICONS.next

      return (
        <div key={item.id}>
          {item.separatorBefore && <div className={MENU_STYLES.separator} />}
          {item.section && <p className={MENU_STYLES.heading}>{item.section}</p>}
          <button
            type="button"
            role="menuitem"
            disabled={item.disabled}
            aria-haspopup={item.submenu ? 'menu' : undefined}
            onMouseEnter={(event) => {
              const box = event.currentTarget.getBoundingClientRect()
              onFlyout?.(
                item.submenu ? { items: item.submenu, x: box.right, y: box.top } : null,
                event.currentTarget
              )
            }}
            onClick={() => {
              if (item.submenu) return
              onClose()
              item.onSelect?.()
            }}
            className={cn(MENU_STYLES.item, item.danger && MENU_STYLES.danger)}
          >
            {Icon && <Icon className={MENU_STYLES.icon} aria-hidden="true" />}
            {item.label}
            {item.shortcut && <span className={MENU_STYLES.shortcut}>{item.shortcut}</span>}
            {item.submenu && <Chevron className={MENU_STYLES.chevron} aria-hidden="true" />}
          </button>
        </div>
      )
    })}
  </>
)

/**
 * Menu layer
 * @param {Object} props - Layer config
 * @param {OpenMenuView} props.menu - Menu to render
 * @param {() => void} props.onClose - Dismiss handler
 * @return {JSX.Element} - Menu overlay
 */

export const MenuLayer = ({ menu, onClose }: { menu: OpenMenuView; onClose: () => void }) => {
  const [query, setQuery] = useState('')
  const [flyout, setFlyout] = useState<Flyout | null>(null)

  const panel = useKeepInside(menu)
  const flyoutPanel = useKeepInside(flyout)

  // Matches reach into flyouts
  const needle = plain(query)
  const results = needle
    ? menu.items
        .flatMap((item) => item.submenu ?? [item])
        .filter((item) => plain(item.label).includes(needle))
    : null

  return (
    <>
      <div className="fixed inset-0 z-[65]" role="presentation" onMouseDown={onClose} />
      <div
        ref={panel}
        role="menu"
        aria-label={menu.title}
        className={MENU_STYLES.panel}
        style={{ left: menu.x, top: menu.y }}
      >
        {menu.searchable && (
          <input
            autoFocus
            type="search"
            value={query}
            placeholder={MENU_COPY.search}
            aria-label={MENU_COPY.search}
            className={MENU_STYLES.search}
            onChange={(event) => {
              setQuery(event.target.value)
              setFlyout(null)
            }}
          />
        )}
        {menu.title && !results && <p className={MENU_STYLES.label}>{menu.title}</p>}
        <div className={MENU_STYLES.scroll}>
          {results?.length === 0 && <p className={MENU_STYLES.empty}>{MENU_COPY.empty}</p>}
          <MenuRows
            items={results ?? menu.items}
            onClose={onClose}
            onFlyout={results ? undefined : (next) => setFlyout(next)}
          />
        </div>
      </div>
      {flyout && !results && (
        <div
          ref={flyoutPanel}
          role="menu"
          className={MENU_STYLES.panel}
          style={{ left: flyout.x, top: flyout.y }}
        >
          <MenuRows items={flyout.items} onClose={onClose} />
        </div>
      )}
    </>
  )
}
