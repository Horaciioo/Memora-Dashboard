'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'

import { ICONS, type IconName } from '@/declarations/ui/icons'
import { MENU_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Entry of a floating menu
 * @typedef {Object} MenuItem
 * @property {string} id - Entry identifier
 * @property {string} label - Display label
 * @property {IconName} [icon] - Leading icon
 * @property {boolean} [danger] - Painted as destructive
 * @property {string} [shortcut] - Keyboard hint
 * @property {boolean} [disabled] - Blocks selection
 * @property {boolean} [separatorBefore] - Draws a rule above
 * @property {() => void} onSelect - Selection handler
 */

export interface MenuItem {
  id: string
  label: string
  icon?: IconName
  danger?: boolean
  shortcut?: string
  disabled?: boolean
  separatorBefore?: boolean
  onSelect: () => void
}

/**
 * Open menu state
 * @typedef {Object} OpenMenu
 * @property {string} [title] - Section label above the entries
 * @property {MenuItem[]} items - Entries
 * @property {number} x - Screen x coordinate
 * @property {number} y - Screen y coordinate
 */

interface OpenMenu {
  title?: string
  items: MenuItem[]
  x: number
  y: number
}

/**
 * Menu context
 * @typedef {Object} MenuContextValue
 * @property {(items: MenuItem[], origin: {x: number, y: number}, title?: string) => void} openMenu - Raise a menu
 * @property {(items: MenuItem[], title?: string) => (event: MouseEvent) => void} contextMenu - Right click handler
 * @property {() => void} closeMenu - Dismiss the menu
 */

interface MenuContextValue {
  openMenu: (items: MenuItem[], origin: { x: number; y: number }, title?: string) => void
  contextMenu: (items: MenuItem[], title?: string) => (event: MouseEvent) => void
  closeMenu: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

// Room kept so the panel never overflows the viewport
const EDGE_MARGIN = 12
const ESTIMATED_WIDTH = 224
const ITEM_HEIGHT = 32

/**
 * Menu provider
 * @param {Object} props - Provider config
 * @param {ReactNode} props.children - Tree children
 * @return {JSX.Element} - Provider with layer
 */

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menu, setMenu] = useState<OpenMenu | null>(null)

  const closeMenu = useCallback(() => setMenu(null), [])

  const openMenu = useCallback(
    (items: MenuItem[], origin: { x: number; y: number }, title?: string) => {
      if (items.length === 0) return

      // Flip the panel back inside the viewport when it would overflow
      const height = items.length * ITEM_HEIGHT + (title ? ITEM_HEIGHT : 0)
      const x = Math.min(origin.x, window.innerWidth - ESTIMATED_WIDTH - EDGE_MARGIN)
      const y = Math.min(origin.y, window.innerHeight - height - EDGE_MARGIN)

      setMenu({ items, title, x: Math.max(EDGE_MARGIN, x), y: Math.max(EDGE_MARGIN, y) })
    },
    []
  )

  const contextMenu = useCallback(
    (items: MenuItem[], title?: string) => (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      openMenu(items, { x: event.clientX, y: event.clientY }, title)
    },
    [openMenu]
  )

  useEffect(() => {
    if (!menu) return

    const dismiss = () => closeMenu()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menu, closeMenu])

  const value = useMemo<MenuContextValue>(
    () => ({ openMenu, contextMenu, closeMenu }),
    [openMenu, contextMenu, closeMenu]
  )

  return (
    <MenuContext.Provider value={value}>
      {children}
      {menu && <MenuLayer menu={menu} onClose={closeMenu} />}
    </MenuContext.Provider>
  )
}

/**
 * Menu layer
 * @param {Object} props - Layer config
 * @param {OpenMenu} props.menu - Menu to render
 * @param {() => void} props.onClose - Dismiss handler
 * @return {JSX.Element} - Menu overlay
 */

const MenuLayer = ({ menu, onClose }: { menu: OpenMenu; onClose: () => void }) => (
  <>
    <div className="fixed inset-0 z-[65]" role="presentation" onMouseDown={onClose} />
    <div
      role="menu"
      aria-label={menu.title}
      className={MENU_STYLES.panel}
      style={{ left: menu.x, top: menu.y }}
    >
      {menu.title && <p className={MENU_STYLES.label}>{menu.title}</p>}
      {menu.items.map((item) => {
        const Icon = item.icon ? ICONS[item.icon] : null

        return (
          <div key={item.id}>
            {item.separatorBefore && <div className={MENU_STYLES.separator} />}
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                onClose()
                item.onSelect()
              }}
              className={cn(MENU_STYLES.item, item.danger && MENU_STYLES.danger)}
            >
              {Icon && <Icon className={MENU_STYLES.icon} aria-hidden="true" />}
              {item.label}
              {item.shortcut && <span className={MENU_STYLES.shortcut}>{item.shortcut}</span>}
            </button>
          </div>
        )
      })}
    </div>
  </>
)

/**
 * Use menu
 * @return {MenuContextValue} - Menu actions
 */

export const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext)
  if (!context) throw new Error('useMenu must be used within MenuProvider')

  return context
}
